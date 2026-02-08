from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    password: str
    role: str = "buyer" # buyer, seller

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_approved: bool
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# --- Product Schemas ---
class ProductBase(BaseModel):
    title: str
    description: str
    category: str
    images: List[str] = []
    listing_type: str = "direct" # direct, auction

class ProductCreate(ProductBase):
    # Direct
    price: Optional[float] = None
    stock: Optional[int] = 1
    
    # Auction
    start_bid: Optional[float] = None
    min_bid_increment: Optional[float] = 1.0
    end_time: Optional[datetime] = None

class ProductResponse(ProductBase):
    id: int
    seller_id: int
    status: str
    price: Optional[float]
    current_highest_bid: Optional[float]
    end_time: Optional[datetime]
    created_at: datetime
    class Config:
        from_attributes = True

# --- Bid Schemas ---
class BidCreate(BaseModel):
    amount: float

class BidResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    username: Optional[str] = None # Populated manually or via validator
    amount: float
    timestamp: datetime
    class Config:
        from_attributes = True
