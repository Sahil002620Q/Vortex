from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
import auth
from datetime import datetime, timedelta
import random

# Init DB
models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

def seed():
    print("Seeding Database...")

    # 1. Create Users
    users = [
        {"username": "collector_king", "email": "king@vortex.com", "role": "seller"},
        {"username": "history_buff", "email": "buff@vortex.com", "role": "buyer"},
        {"username": "antiques_lover", "email": "lover@vortex.com", "role": "buyer"},
        {"username": "admin", "email": "admin@vortex.com", "role": "admin"}
    ]

    db_users = {}
    for u in users:
        existing = db.query(models.User).filter(models.User.email == u["email"]).first()
        if not existing:
            hashed_pw = auth.get_password_hash("password123")
            new_user = models.User(
                username=u["username"],
                email=u["email"],
                hashed_password=hashed_pw,
                role=u["role"],
                is_approved=True
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            db_users[u["email"]] = new_user
            print(f"Created user: {u['username']}")
        else:
            db_users[u["email"]] = existing
            print(f"User exists: {u['username']}")

    # 2. Create Products (Auctions)
    products_data = [
        {
            "title": "Rare Mughal Era Gold Mohur (1600s)",
            "description": "An extremely rare gold coin from the reign of Emperor Akbar. Perfect condition, certified authenticity. A piece of Indian history.",
            "price": 50000, 
            "images": ["https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Akbar_Mohur.jpg/800px-Akbar_Mohur.jpg"],
            "category": "Antiques",
            "listing_type": "auction",
            "min_bid_increment": 2000,
            "seller": db_users["king@vortex.com"]
        },
        {
            "title": "1947 Independence Day Stamp Set",
            "description": "Complete set of original stamps issued on 15th August 1947. Mint condition with original gum. Highly sought after by philatelists.",
            "price": 15000,
            "images": ["https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/India_1947_Independence_3a_stamp.jpg/640px-India_1947_Independence_3a_stamp.jpg"],
            "category": "Collectibles",
            "listing_type": "auction",
            "min_bid_increment": 500,
            "seller": db_users["king@vortex.com"]
        },
        {
            "title": "Vintage HMT Pilot Watch (Mechanical)",
            "description": "Original 1980s HMT Pilot mechanical watch. Black dial, 17 jewels, fully serviced and working perfectly. Includes original strap.",
            "price": 3500,
            "images": ["https://upload.wikimedia.org/wikipedia/commons/2/28/HMT_Pilot.jpg"],
            "category": "Watches",
            "listing_type": "auction",
            "min_bid_increment": 100,
            "seller": db_users["king@vortex.com"]
        },
        {
            "title": "Old Maharaja's Sword with Scabbard",
            "description": "Ceremonial sword from Rajasthan, late 19th century. Damascus steel blade with silver koftgari work on the hilt. Velvet covered scabbard.",
            "price": 120000,
            "images": ["https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Talwar_sword.jpg/640px-Talwar_sword.jpg"],
            "category": "Antiques",
            "listing_type": "auction",
            "min_bid_increment": 5000,
            "seller": db_users["king@vortex.com"]
        }
    ]

    for p in products_data:
        existing_prod = db.query(models.Product).filter(models.Product.title == p["title"]).first()
        if not existing_prod:
            new_prod = models.Product(
                title=p["title"],
                description=p["description"],
                price=p["price"], # Starting price
                current_highest_bid=p["price"],
                min_bid_increment=p["min_bid_increment"],
                category=p["category"],
                listing_type=p["listing_type"],
                status="active",
                images=p["images"],
                seller_id=p["seller"].id,
                created_at=datetime.utcnow(),
                end_time=datetime.utcnow() + timedelta(days=3) # Ends in 3 days
            )
            db.add(new_prod)
            db.commit()
            db.refresh(new_prod)
            print(f"Created product: {p['title']}")

            # 3. Create Bids (Fake History)
            # Bidder 1
            bid1_amount = p["price"] + p["min_bid_increment"]
            bid1 = models.Bid(
                amount=bid1_amount,
                product_id=new_prod.id,
                user_id=db_users["buff@vortex.com"].id,
                timestamp=datetime.utcnow() - timedelta(hours=random.randint(5, 10))
            )
            db.add(bid1)
            
            # Bidder 2 (Higher)
            bid2_amount = bid1_amount + p["min_bid_increment"] * 2
            bid2 = models.Bid(
                amount=bid2_amount,
                product_id=new_prod.id,
                user_id=db_users["lover@vortex.com"].id,
                timestamp=datetime.utcnow() - timedelta(hours=random.randint(1, 4))
            )
            db.add(bid2)

            # Update Product
            new_prod.current_highest_bid = bid2_amount
            db.commit()
            print(f"Added bids for {p['title']}")

        else:
            print(f"Product exists: {p['title']}")

    print("Database Seeded Successfully!")
    db.close()

if __name__ == "__main__":
    seed()
