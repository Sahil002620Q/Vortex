from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta
import models, schemas, database, auth

# Init DB
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Marketplace API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Auth Endpoints ---

@app.post("/auth/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": new_user}

@app.post("/auth/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    if not user or not auth.verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user": user}

@app.get("/auth/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- Product Endpoints ---

@app.get("/products", response_model=List[schemas.ProductResponse])
def get_products(
    category: str = None, 
    listing_type: str = None, 
    min_price: float = None,
    max_price: float = None,
    search: str = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Product).filter(models.Product.status == "active")
    if category:
        query = query.filter(models.Product.category == category)
    if listing_type:
        query = query.filter(models.Product.listing_type == listing_type)
    
    # Filter by price (Direct Price OR Current Bid)
    if min_price is not None:
        query = query.filter((models.Product.price >= min_price) | (models.Product.current_highest_bid >= min_price))
    if max_price is not None:
        query = query.filter((models.Product.price <= max_price) | (models.Product.current_highest_bid <= max_price))
        
    if search:
        query = query.filter(models.Product.title.contains(search) | models.Product.description.contains(search))
        
    return query.all()

@app.post("/products", response_model=schemas.ProductResponse)
def create_product(
    product: schemas.ProductCreate, 
    db: Session = Depends(database.get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role != "seller" and current_user.role != "admin": 
        raise HTTPException(status_code=403, detail="Only sellers can post products")
    if not current_user.is_approved:
        raise HTTPException(status_code=403, detail="Seller account not approved yet")

    new_product = models.Product(**product.dict(), seller_id=current_user.id)
    if product.listing_type == 'auction':
        new_product.current_highest_bid = product.start_bid or 0
        new_product.price = None # Ensure no direct price for auction
    else:
        new_product.start_bid = None
        new_product.current_highest_bid = 0
        
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.get("/products/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: int, db: Session = Depends(database.get_db)):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products/{product_id}/buy")
def buy_product(
    product_id: int, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).with_for_update().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.listing_type != 'direct':
        raise HTTPException(status_code=400, detail="This is not a direct purchase item")
    if product.status != 'active':
        raise HTTPException(status_code=400, detail="Item not available")
    if product.stock < 1:
        raise HTTPException(status_code=400, detail="Out of stock") # Should check stock logic if we actually decrement
        
    # Create Transaction
    commission_rate = 0.05 # Default 5%
    total_amount = product.price
    commission_amount = total_amount * commission_rate
    net_seller_amount = total_amount - commission_amount
    
    transaction = models.Transaction(
        product_id=product.id,
        buyer_id=current_user.id,
        seller_id=product.seller_id,
        total_amount=total_amount,
        commission_rate=commission_rate,
        commission_amount=commission_amount,
        net_seller_amount=net_seller_amount,
        status="completed" # Assuming instant payment for now
    )
    
    product.status = 'sold'
    product.stock -= 1
    
    db.add(transaction)
    db.commit()
    return {"message": "Purchase successful", "transaction_id": transaction.id}
    
@app.post("/products/{product_id}/close_auction")
def close_auction(
    product_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).with_for_update().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Auth check: Only seller or admin can close manually? 
    # Or anyone can trigger if time is up?
    if current_user.id != product.seller_id and current_user.role != 'admin':
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if product.listing_type != 'auction':
        raise HTTPException(status_code=400, detail="Not an auction")
    if product.status != 'active':
        raise HTTPException(status_code=400, detail="Auction already closed")
        
    # Determine winner
    highest_bid = db.query(models.Bid).filter(models.Bid.product_id == product_id).order_by(models.Bid.amount.desc()).first()
    
    if not highest_bid:
        product.status = 'ended'
        db.commit()
        return {"message": "Auction ended with no bids"}
        
    # Execute Transaction
    commission_rate = 0.05
    total_amount = highest_bid.amount
    commission_amount = total_amount * commission_rate
    net_seller_amount = total_amount - commission_amount
    
    transaction = models.Transaction(
        product_id=product.id,
        buyer_id=highest_bid.user_id,
        seller_id=product.seller_id,
        total_amount=total_amount,
        commission_rate=commission_rate,
        commission_amount=commission_amount,
        net_seller_amount=net_seller_amount,
        status="pending" # Winner needs to pay? Or assume auto-charge?
    )
    
    product.status = 'sold'
    db.add(transaction)
    db.commit()
    return {"message": "Auction closed, winner declared", "winner_id": highest_bid.user_id}

# --- Admin Endpoints ---

@app.get("/admin/users", response_model=List[schemas.UserResponse])
def get_all_users(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != 'admin':
         raise HTTPException(status_code=403, detail="Admin only")
    return db.query(models.User).all()

@app.post("/admin/users/{user_id}/approve")
def approve_seller(user_id: int, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    if current_user.role != 'admin':
         raise HTTPException(status_code=403, detail="Admin only")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_approved = True
    db.commit()
    return {"message": f"User {user.username} approved"}

# --- User Dashboard Endpoints ---

@app.get("/users/me/products", response_model=List[schemas.ProductResponse])
def get_my_products(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Product).filter(models.Product.seller_id == current_user.id).all()

@app.get("/users/me/bids", response_model=List[schemas.BidResponse])
def get_my_bids(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Bid).filter(models.Bid.user_id == current_user.id).order_by(models.Bid.timestamp.desc()).all()

# We need a Transaction Response schema but let's just return dict or create one quickly
@app.get("/users/me/orders")
def get_my_orders(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Buyer orders
    orders = db.query(models.Transaction).filter(models.Transaction.buyer_id == current_user.id).all()
    # We might want to include Product details? 
    # For simplicity, returning raw transaction but we should probably join with Product.
    return orders



# --- Bidding Endpoints & WebSocket ---

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/bids/{product_id}")
async def websocket_endpoint(websocket: WebSocket, product_id: int):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # client sends nothing really, just listens usually. 
            # Or client sends a 'ping'
            await manager.broadcast(f"Update for {product_id}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/products/{product_id}/bid", response_model=schemas.BidResponse)
async def place_bid(
    product_id: int, 
    bid: schemas.BidCreate, 
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    if product.listing_type != 'auction':
        raise HTTPException(status_code=400, detail="This is not an auction")
    if product.status != 'active':
        raise HTTPException(status_code=400, detail="Auction is not active")
    if product.end_time and datetime.utcnow() > product.end_time:
        product.status = 'ended'
        db.commit()
        raise HTTPException(status_code=400, detail="Auction has ended")
        
    # Check amount
    min_required = product.current_highest_bid + product.min_bid_increment
    if bid.amount < min_required:
        raise HTTPException(status_code=400, detail=f"Bid must be at least {min_required}")

    # Create Bid
    new_bid = models.Bid(
        product_id=product_id,
        user_id=current_user.id,
        amount=bid.amount
    )
    
    # Update Product
    product.current_highest_bid = bid.amount
    
    db.add(new_bid)
    db.commit()
    db.refresh(new_bid)
    
    # Notify WebSocket clients
    await manager.broadcast(f"new_bid:{product_id}:{bid.amount}")
    
    return new_bid
