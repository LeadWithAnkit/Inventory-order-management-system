from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal
from typing import Optional
from app.schemas.product import ProductResponse

class OrderItemBase(BaseModel):
    product_id: int = Field(..., gt=0, description="Product ID must be positive")
    quantity: int = Field(..., gt=0, description="Quantity must be greater than zero")

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(OrderItemBase):
    id: int
    unit_price: Decimal
    product: Optional[ProductResponse] = None

    model_config = ConfigDict(from_attributes=True)
