from pydantic import BaseModel, Field, ConfigDict, field_validator
from decimal import Decimal
from datetime import datetime
from typing import Optional

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Product Name")
    sku: str = Field(..., min_length=1, max_length=50, description="Unique stock keeping unit")
    description: Optional[str] = None
    price: Decimal = Field(..., ge=0, description="Product price must be non-negative")
    stock_quantity: int = Field(..., ge=0, description="Stock quantity must be non-negative")
    is_active: bool = Field(default=True, description="Whether product is active")

    @field_validator("name", "sku")
    @classmethod
    def clean_required_text(cls, value: str) -> str:
        if value is None:
            raise ValueError("field is required")
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("field must not be empty or whitespace only")
        return cleaned

    @field_validator("sku")
    @classmethod
    def normalize_sku(cls, value: str) -> str:
        return value.strip().upper()

    @field_validator("description")
    @classmethod
    def clean_description(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = value.strip()
        return cleaned or None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=50)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None

    @field_validator("name", "sku")
    @classmethod
    def clean_required_text(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("field must not be empty or whitespace only")
        return cleaned

    @field_validator("sku")
    @classmethod
    def normalize_sku(cls, value: Optional[str]) -> Optional[str]:
        return value.strip().upper() if value is not None else value

    @field_validator("description")
    @classmethod
    def clean_description(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = value.strip()
        return cleaned or None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
