from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="buyer")  # buyer, seller, admin
    is_approved = Column(Boolean, default=True)  # Sellers might need approval
    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="seller")
    bids = relationship("Bid", back_populates="bidder")
    # orders_bought = relationship("Transaction", foreign_keys="Transaction.buyer_id")
    # orders_sold = relationship("Transaction", foreign_keys="Transaction.seller_id")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    seller_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    description = Column(Text)
    category = Column(String, index=True)
    images = Column(JSON, default=[]) # Storing list of image URLs
    
    # Types: 'direct', 'auction'
    listing_type = Column(String, default="direct") 
    
    # Status: 'active', 'sold', 'ended', 'banned'
    status = Column(String, default="active")
    
    # Direct Purchase Fields
    price = Column(Float, nullable=True)
    stock = Column(Integer, default=1)
    
    # Auction Fields
    start_bid = Column(Float, nullable=True)
    min_bid_increment = Column(Float, default=1.0)
    current_highest_bid = Column(Float, default=0.0)
    end_time = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    seller = relationship("User", back_populates="products")
    bids = relationship("Bid", back_populates="product", cascade="all, delete-orphan")

class Bid(Base):
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="bids")
    bidder = relationship("User", back_populates="bids")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    buyer_id = Column(Integer, ForeignKey("users.id"))
    seller_id = Column(Integer, ForeignKey("users.id"))
    
    total_amount = Column(Float) # The final price paid
    commission_rate = Column(Float, default=0.05) # Stored at time of transaction
    commission_amount = Column(Float) # Calculated fee
    net_seller_amount = Column(Float) # Money to seller

    status = Column(String, default="pending") # pending, completed, disputed
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product")
    buyer = relationship("User", foreign_keys=[buyer_id])
    seller = relationship("User", foreign_keys=[seller_id])
