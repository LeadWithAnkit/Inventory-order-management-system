from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException, status
from decimal import Decimal
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.customer import Customer
from app.schemas.order import OrderCreate, OrderStatusUpdate

def list_orders(db: Session):
    # Eagerly load customer and items to avoid N+1 query problem
    return db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product)
    ).order_by(Order.created_at.desc()).all()

def get_order(db: Session, order_id: int):
    order = db.query(Order).options(
        joinedload(Order.customer),
        joinedload(Order.items).joinedload(OrderItem.product)
    ).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found"
        )
    return order

def create_order(db: Session, order_in: OrderCreate) -> Order:
    # 1. Verify customer exists
    customer = db.query(Customer).filter(Customer.id == order_in.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {order_in.customer_id} not found"
        )

    # 2. Extract product IDs and request quantities
    items_to_create = []
    product_ids = [item.product_id for item in order_in.items]
    
    # We will fetch and lock products to ensure transactional stock verification
    # Using 'with_for_update' prevents race conditions from concurrent orders
    products = db.query(Product).filter(
        Product.id.in_(product_ids)
    ).with_for_update().all()
    
    product_map = {p.id: p for p in products}
    
    total_amount = Decimal("0.00")
    
    # 3. Validate stock and compute prices
    for item in order_in.items:
        product = product_map.get(item.product_id)
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {item.product_id} does not exist"
            )
        
        if not product.is_active:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product '{product.name}' (SKU: {product.sku}) is currently inactive and cannot be ordered"
            )
            
        if product.stock_quantity < item.quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). "
                       f"Requested: {item.quantity}, Available: {product.stock_quantity}"
            )
            
        # Deduct stock
        product.stock_quantity -= item.quantity
        
        # Calculate pricing
        item_total = product.price * item.quantity
        total_amount += item_total
        
        # Create OrderItem object
        db_item = OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price
        )
        items_to_create.append(db_item)

    # 4. Create Order
    db_order = Order(
        customer_id=order_in.customer_id,
        status="confirmed",  # Instantly confirmed since stock is secured
        total_amount=total_amount,
        items=items_to_create
    )
    
    db.add(db_order)
    
    try:
        db.commit()
        # Eagerly load relationships before returning
        return get_order(db, db_order.id)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating the order: {str(e)}"
        )

def update_order_status(db: Session, order_id: int, status_in: OrderStatusUpdate) -> Order:
    db_order = get_order(db, order_id)
    old_status = db_order.status.lower()
    new_status = status_in.status.lower()
    
    if old_status == new_status:
        return db_order

    # Lock order items and products for update to change stock safely
    product_ids = [item.product_id for item in db_order.items]
    products = db.query(Product).filter(
        Product.id.in_(product_ids)
    ).with_for_update().all()
    
    product_map = {p.id: p for p in products}

    # Case 1: Cancelling an order that was confirmed/fulfilled -> Restock inventory
    if new_status == "cancelled" and old_status != "cancelled":
        for item in db_order.items:
            product = product_map.get(item.product_id)
            if product:
                product.stock_quantity += item.quantity

    # Case 2: Reactivating/confirming a cancelled order -> Re-deduct and validate inventory
    elif old_status == "cancelled" and new_status != "cancelled":
        for item in db_order.items:
            product = product_map.get(item.product_id)
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with ID {item.product_id} no longer exists. Cannot restore order."
                )
            if not product.is_active:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Product '{product.name}' is inactive. Cannot restore order."
                )
            if product.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Insufficient stock to restore order. Product '{product.name}' needs {item.quantity}, but only has {product.stock_quantity} available."
                )
            product.stock_quantity -= item.quantity

    db_order.status = new_status
    
    try:
        db.commit()
        return get_order(db, db_order.id)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update order status: {str(e)}"
        )

def cancel_order(db: Session, order_id: int) -> Order:
    return update_order_status(db, order_id, OrderStatusUpdate(status="cancelled"))
