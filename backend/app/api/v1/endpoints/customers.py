from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.customer import CustomerCreate, CustomerUpdate, CustomerResponse
from app.services import customer_service

router = APIRouter()

@router.get("/", response_model=List[CustomerResponse])
def get_customers(
    search: Optional[str] = Query(None, description="Search customers by Name or Email"),
    db: Session = Depends(get_db)
):
    return customer_service.list_customers(db, search=search)

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return customer_service.get_customer(db, customer_id)

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(customer_in: CustomerCreate, db: Session = Depends(get_db)):
    return customer_service.create_customer(db, customer_in)

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(customer_id: int, customer_in: CustomerUpdate, db: Session = Depends(get_db)):
    return customer_service.update_customer(db, customer_id, customer_in)

@router.delete("/{customer_id}", response_model=CustomerResponse)
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    return customer_service.delete_customer(db, customer_id)
