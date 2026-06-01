from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.customer import CustomerCreate, CustomerUpdate

def list_customers(db: Session, search: str = None):
    query = db.query(Customer)
    if search:
        query = query.filter(
            (Customer.name.ilike(f"%{search}%")) | (Customer.email.ilike(f"%{search}%"))
        )
    return query.order_by(Customer.name).all()

def get_customer(db: Session, customer_id: int):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )
    return customer

def get_customer_by_email(db: Session, email: str):
    return db.query(Customer).filter(Customer.email == email).first()

def create_customer(db: Session, customer_in: CustomerCreate):
    # Check duplicate email
    if get_customer_by_email(db, customer_in.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Customer with email '{customer_in.email}' already exists"
        )
        
    # Assemble phone from country_code + mobile when provided
    phone_val = None
    if getattr(customer_in, "country_code", None) is not None and getattr(customer_in, "mobile", None) is not None:
        phone_val = f"+{customer_in.country_code}{customer_in.mobile}"
    else:
        phone_val = getattr(customer_in, "phone", None)

    db_customer = Customer(
        name=customer_in.name,
        email=customer_in.email,
        phone=phone_val,
        address=customer_in.address
    )
    db.add(db_customer)
    try:
        db.commit()
        db.refresh(db_customer)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Database integrity violation while creating customer"
        )
    return db_customer

def update_customer(db: Session, customer_id: int, customer_in: CustomerUpdate):
    db_customer = get_customer(db, customer_id)
    
    # Check duplicate email if it is changing
    if customer_in.email is not None and customer_in.email != db_customer.email:
        if get_customer_by_email(db, customer_in.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Customer with email '{customer_in.email}' already exists"
            )
            
    update_data = customer_in.model_dump(exclude_unset=True)
    # If country_code or mobile present, require both to form the phone
    cc = update_data.pop("country_code", None)
    mobile = update_data.pop("mobile", None)
    if (cc is not None) ^ (mobile is not None):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both country_code and mobile must be provided together to update phone"
        )
    if cc is not None and mobile is not None:
        update_data["phone"] = f"+{cc}{mobile}"

    for field, value in update_data.items():
        setattr(db_customer, field, value)
        
    try:
        db.commit()
        db.refresh(db_customer)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Database integrity violation while updating customer"
        )
    return db_customer

def delete_customer(db: Session, customer_id: int):
    db_customer = get_customer(db, customer_id)
    
    # Check if customer has orders
    order_exists = db.query(Order).filter(Order.customer_id == customer_id).first()
    if order_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete customer because they have existing orders. Keep the customer record to preserve transaction history."
        )
        
    db.delete(db_customer)
    db.commit()
    return db_customer
