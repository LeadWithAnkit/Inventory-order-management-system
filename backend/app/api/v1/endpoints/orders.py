from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderResponse
from app.services import order_service

router = APIRouter()

@router.get("/", response_model=List[OrderResponse])
def get_orders(db: Session = Depends(get_db)):
    return order_service.list_orders(db)

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db)):
    return order_service.get_order(db, order_id)

@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(order_in: OrderCreate, db: Session = Depends(get_db)):
    return order_service.create_order(db, order_in)

@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: int, status_in: OrderStatusUpdate, db: Session = Depends(get_db)):
    return order_service.update_order_status(db, order_id, status_in)

@router.delete("/{order_id}", response_model=OrderResponse)
def cancel_order(order_id: int, db: Session = Depends(get_db)):
    return order_service.cancel_order(db, order_id)
