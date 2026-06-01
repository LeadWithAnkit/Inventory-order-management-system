from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models.product import Product
from app.models.order_item import OrderItem
from app.schemas.product import ProductCreate, ProductUpdate

def list_products(db: Session, active_only: bool = False, search: str = None):
    query = db.query(Product)
    if active_only:
        query = query.filter(Product.is_active == True)
    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) | (Product.sku.ilike(f"%{search}%"))
        )
    return query.order_by(Product.name).all()

def get_product(db: Session, product_id: int):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    return product

def get_product_by_sku(db: Session, sku: str):
    return db.query(Product).filter(Product.sku == sku).first()

def create_product(db: Session, product_in: ProductCreate):
    # Check duplicate SKU
    if get_product_by_sku(db, product_in.sku):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Product with SKU '{product_in.sku}' already exists"
        )
    
    db_product = Product(
        sku=product_in.sku,
        name=product_in.name,
        description=product_in.description,
        price=product_in.price,
        stock_quantity=product_in.stock_quantity,
        is_active=product_in.is_active
    )
    db.add(db_product)
    try:
        db.commit()
        db.refresh(db_product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Database integrity violation while creating product"
        )
    return db_product

def update_product(db: Session, product_id: int, product_in: ProductUpdate):
    db_product = get_product(db, product_id)
    
    # If SKU is changing, check if new SKU is already taken
    if product_in.sku is not None and product_in.sku != db_product.sku:
        if get_product_by_sku(db, product_in.sku):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Product with SKU '{product_in.sku}' already exists"
            )
            
    update_data = product_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_product, field, value)
        
    try:
        db.commit()
        db.refresh(db_product)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Database integrity violation while updating product"
        )
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    
    # Check if product is referenced by any order items
    order_item_exists = db.query(OrderItem).filter(OrderItem.product_id == product_id).first()
    if order_item_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete product because it has been ordered. Deactivate the product instead to prevent further orders."
        )
        
    db.delete(db_product)
    db.commit()
    return db_product
