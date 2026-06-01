from pydantic import BaseModel, Field, ConfigDict
from decimal import Decimal
from datetime import datetime
from typing import List, Literal, Optional
from app.schemas.customer import CustomerResponse
from app.schemas.order_item import OrderItemCreate, OrderItemResponse

class OrderCreate(BaseModel):
    customer_id: int = Field(..., gt=0, description="Customer ID must be positive")
    items: List[OrderItemCreate] = Field(..., min_length=1, description="Order must contain at least one item")

class OrderStatusUpdate(BaseModel):
    status: Literal["pending", "confirmed", "fulfilled", "cancelled"] = Field(..., description="Target order status")

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    status: str
    total_amount: Decimal
    created_at: datetime
    updated_at: datetime
    customer: Optional[CustomerResponse] = None
    items: List[OrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
