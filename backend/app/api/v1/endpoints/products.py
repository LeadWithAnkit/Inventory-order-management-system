from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services import product_service

router = APIRouter()

@router.get("/", response_model=List[ProductResponse])
def get_products(
    active_only: bool = Query(False, description="Filter for only active products"),
    search: Optional[str] = Query(None, description="Search products by SKU or Name"),
    db: Session = Depends(get_db)
):
    return product_service.list_products(db, active_only=active_only, search=search)

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    return product_service.get_product(db, product_id)

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate, db: Session = Depends(get_db)):
    return product_service.create_product(db, product_in)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(product_id: int, product_in: ProductUpdate, db: Session = Depends(get_db)):
    return product_service.update_product(db, product_id, product_in)

@router.delete("/{product_id}", response_model=ProductResponse)
def delete_product(product_id: int, db: Session = Depends(get_db)):
    return product_service.delete_product(db, product_id)
