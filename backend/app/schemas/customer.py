from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator
from datetime import datetime
from typing import Optional
import re

class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr = Field(..., description="Unique customer email address")
    phone: Optional[str] = Field(None, max_length=50, description="Combined phone stored as +<country><mobile>")
    address: Optional[str] = None

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        if value is None:
            raise ValueError("name is required")
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("name must not be empty or whitespace only")
        return cleaned

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).strip().lower()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        s = value.strip()
        if not s:
            return None
        # remove all non-digit characters
        digits = re.sub(r"\D", "", s)
        # expect country + mobile combined; mobile must be at least 10 digits
        if len(digits) < 11:
            raise ValueError("phone must include country code and a 10-digit mobile number")
        # ensure last 10 digits are the mobile part
        mobile = digits[-10:]
        if len(mobile) != 10:
            raise ValueError("mobile number must be exactly 10 digits")
        country = digits[:-10]
        if not country or len(country) > 3:
            raise ValueError("country code must be 1 to 3 digits")
        return f"+{country}{mobile}"

    @field_validator("address")
    @classmethod
    def clean_address(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = value.strip()
        return cleaned or None

class CustomerCreate(CustomerBase):
    # Require explicit country_code and mobile when creating a customer
    country_code: str = Field(..., description="Country dialing code, e.g. +1 or 1")
    mobile: str = Field(..., description="Local mobile number (exactly 10 digits)")

    @field_validator("country_code")
    @classmethod
    def validate_country_code(cls, value: str) -> str:
        s = value.strip()
        s_digits = re.sub(r"\D", "", s)
        if not (1 <= len(s_digits) <= 3):
            raise ValueError("country_code must be 1 to 3 digits")
        return s_digits

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, value: str) -> str:
        s = value.strip()
        digits = re.sub(r"\D", "", s)
        if len(digits) != 10:
            raise ValueError("mobile must be exactly 10 digits")
        return digits

class CustomerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(None, max_length=50, description="Combined phone stored as +<country><mobile>")
    address: Optional[str] = None
    country_code: Optional[str] = Field(None, description="Country dialing code, e.g. +1 or 1")
    mobile: Optional[str] = Field(None, description="Local mobile number (exactly 10 digits)")

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("name must not be empty or whitespace only")
        return cleaned

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: Optional[EmailStr]) -> Optional[str]:
        return str(value).strip().lower() if value is not None else value

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        s = value.strip()
        if not s:
            return None
        # validate combined format: country + 10-digit mobile
        digits = re.sub(r"\D", "", s)
        if len(digits) < 11:
            raise ValueError("phone must include country code and a 10-digit mobile number")
        mobile = digits[-10:]
        if len(mobile) != 10:
            raise ValueError("mobile number must be exactly 10 digits")
        country = digits[:-10]
        if not country or len(country) > 3:
            raise ValueError("country code must be 1 to 3 digits")
        return f"+{country}{mobile}"

    @field_validator("country_code")
    @classmethod
    def validate_country_code_optional(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        s = value.strip()
        s_digits = re.sub(r"\D", "", s)
        if not (1 <= len(s_digits) <= 3):
            raise ValueError("country_code must be 1 to 3 digits")
        return s_digits

    @field_validator("mobile")
    @classmethod
    def validate_mobile_optional(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        s = value.strip()
        digits = re.sub(r"\D", "", s)
        if len(digits) != 10:
            raise ValueError("mobile must be exactly 10 digits")
        return digits

    @field_validator("address")
    @classmethod
    def clean_address(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        cleaned = value.strip()
        return cleaned or None

class CustomerResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
