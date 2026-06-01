import sys
import os
import time
from decimal import Decimal
from sqlalchemy.exc import OperationalError, IntegrityError
from sqlalchemy import text

# Append root directory to path to allow absolute imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import engine, SessionLocal
from app.models.base import Base
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.models.order_item import OrderItem

DEMO_PRODUCTS = [
    {
        "aliases": ["PROD-LP-001", "INV-KBD-001", "ELEC-LTP-001"],
        "sku": "ELEC-LTP-001",
        "name": "Lenovo ThinkPad E14 Laptop",
        "description": "Business laptop with Ryzen 5, 16 GB RAM, and 512 GB SSD for billing and reporting work.",
        "price": Decimal("62990.00"),
        "stock_quantity": 18,
        "is_active": True,
    },
    {
        "aliases": ["PROD-LP-002", "INV-MOU-002", "ELEC-PHN-002"],
        "sku": "ELEC-PHN-002",
        "name": "Samsung Galaxy M35 5G",
        "description": "Mid-range 5G smartphone with AMOLED display and large battery.",
        "price": Decimal("19999.00"),
        "stock_quantity": 42,
        "is_active": True,
    },
    {
        "aliases": ["PROD-LP-003", "INV-MON-003", "ELEC-MON-003"],
        "sku": "ELEC-MON-003",
        "name": "LG 24 Inch Full HD Monitor",
        "description": "IPS monitor for admin counters, billing stations, and reporting desks.",
        "price": Decimal("10499.00"),
        "stock_quantity": 35,
        "is_active": True,
    },
    {
        "aliases": ["PROD-LP-004", "INV-HDS-004", "ELEC-HDS-004"],
        "sku": "ELEC-HDS-004",
        "name": "boAt Rockerz Bluetooth Headset",
        "description": "Wireless headset for support teams and order coordination.",
        "price": Decimal("1499.00"),
        "stock_quantity": 80,
        "is_active": True,
    },
    {
        "aliases": ["PROD-LP-005", "INV-HUB-005", "ELEC-PRN-005"],
        "sku": "ELEC-PRN-005",
        "name": "HP LaserJet MFP Printer",
        "description": "Compact laser printer and scanner for invoices and purchase documents.",
        "price": Decimal("18499.00"),
        "stock_quantity": 0,
        "is_active": True,
    },
    {
        "aliases": ["PROD-LP-006", "INV-KBD-006", "ELEC-KBD-006"],
        "sku": "ELEC-KBD-006",
        "name": "Dell Wired Keyboard",
        "description": "Older wired keyboard model, currently archived.",
        "price": Decimal("799.00"),
        "stock_quantity": 10,
        "is_active": False,
    },
]

DEMO_CUSTOMERS = [
    {
        "aliases": ["alice.j@example.com", "ankit.sharma@example.in", "ankit.tiwari@example.in"],
        "name": "Ankit Tiwari",
        "email": "ankit.tiwari@example.in",
        "phone": "+91 98765 43210",
        "address": "42 MG Road, Indiranagar, Bengaluru, Karnataka 560038",
    },
    {
        "aliases": ["bob.smith@example.com", "aman.verma@example.in", "hardik.srivastava@example.in"],
        "name": "Hardik Srivastava",
        "email": "hardik.srivastava@example.in",
        "phone": "+91 91234 56780",
        "address": "18 Park Street, Kolkata, West Bengal 700016",
    },
    {
        "aliases": ["charlie.b@example.com", "avinash.patil@example.in", "vaibhav.singh@example.in"],
        "name": "Vaibhav Singh",
        "email": "vaibhav.singh@example.in",
        "phone": "+91 99887 76655",
        "address": "9 FC Road, Shivajinagar, Pune, Maharashtra 411005",
    },
    {
        "aliases": ["shikhar.gupta@example.com", "shikhar.gupta@example.in"],
        "name": "Shikhar Gupta",
        "email": "shikhar.gupta@example.in",
        "phone": "+91 90909 80808",
        "address": "27 Civil Lines, Prayagraj, Uttar Pradesh 211001",
    },
]

def refresh_demo_data(db):
    for item in DEMO_PRODUCTS:
        matches = db.query(Product).filter(Product.sku.in_(item["aliases"])).order_by(Product.id).all()
        product = matches[0] if matches else Product()
        if not matches:
            db.add(product)
        for duplicate in matches[1:]:
            if db.query(OrderItem).filter(OrderItem.product_id == duplicate.id).first():
                duplicate.name = item["name"]
                duplicate.description = item["description"]
                duplicate.price = item["price"]
                duplicate.is_active = item["is_active"]
            else:
                db.delete(duplicate)

        product.sku = item["sku"]
        product.name = item["name"]
        product.description = item["description"]
        product.price = item["price"]
        product.is_active = item["is_active"]
        if product.stock_quantity is None:
            product.stock_quantity = item["stock_quantity"]
        db.flush()

    for item in DEMO_CUSTOMERS:
        matches = db.query(Customer).filter(Customer.email.in_(item["aliases"])).order_by(Customer.id).all()
        customer = matches[0] if matches else Customer()
        if not matches:
            db.add(customer)
        for duplicate in matches[1:]:
            if db.query(Order).filter(Order.customer_id == duplicate.id).first():
                duplicate.name = item["name"]
                duplicate.phone = item["phone"]
                duplicate.address = item["address"]
            else:
                db.delete(duplicate)

        customer.name = item["name"]
        customer.email = item["email"]
        customer.phone = item["phone"]
        customer.address = item["address"]
        db.flush()

    for order in db.query(Order).all():
        total = Decimal("0.00")
        for order_item in order.items:
            product = db.query(Product).filter(Product.id == order_item.product_id).first()
            if product:
                order_item.unit_price = product.price
                total += product.price * order_item.quantity
        order.total_amount = total

    db.commit()
    print("Demo records refreshed successfully!")

def seed_database():
    print("Waiting for database connection...")
    db_connected = False
    for i in range(15):
        try:
            db_conn = SessionLocal()
            # Simple ping
            db_conn.execute(text("SELECT 1"))
            db_conn.close()
            db_connected = True
            print("Database is ready! Proceeding with schema creation and seeding...")
            break
        except (OperationalError, Exception) as e:
            print(f"Database not reachable yet (attempt {i+1}/15). Error: {str(e)}")
            print("Retrying in 2 seconds...")
            time.sleep(2)
            
    if not db_connected:
        print("Database could not be reached. Exiting.")
        sys.exit(1)

    print("Creating tables in database...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Existing local volumes may contain the old demo data. Refresh known
        # demo rows without touching unrelated user-created records.
        if db.query(Product).first() is not None:
            print("Database already has data. Refreshing demo records if needed...")
            refresh_demo_data(db)
            return

        print("Seeding database with sample records...")
        
        # 1. Seed Products
        products = [
            Product(
                sku="ELEC-LTP-001",
                name="Lenovo ThinkPad E14 Laptop",
                description="Business laptop with Ryzen 5, 16 GB RAM, and 512 GB SSD for billing and reporting work.",
                price=Decimal("62990.00"),
                stock_quantity=18,
                is_active=True
            ),
            Product(
                sku="ELEC-PHN-002",
                name="Samsung Galaxy M35 5G",
                description="Mid-range 5G smartphone with AMOLED display and large battery.",
                price=Decimal("19999.00"),
                stock_quantity=42,
                is_active=True
            ),
            Product(
                sku="ELEC-MON-003",
                name="LG 24 Inch Full HD Monitor",
                description="IPS monitor for admin counters, billing stations, and reporting desks.",
                price=Decimal("10499.00"),
                stock_quantity=35,
                is_active=True
            ),
            Product(
                sku="ELEC-HDS-004",
                name="boAt Rockerz Bluetooth Headset",
                description="Wireless headset for support teams and order coordination.",
                price=Decimal("1499.00"),
                stock_quantity=80,
                is_active=True
            ),
            Product(
                sku="ELEC-PRN-005",
                name="HP LaserJet MFP Printer",
                description="Compact laser printer and scanner for invoices and purchase documents.",
                price=Decimal("18499.00"),
                stock_quantity=0,  # Seed one out-of-stock item to test validations
                is_active=True
            ),
            Product(
                sku="ELEC-KBD-006",
                name="Dell Wired Keyboard",
                description="Older wired keyboard model, currently archived.",
                price=Decimal("799.00"),
                stock_quantity=10,
                is_active=False  # Seed one inactive item to test validations
            )
        ]
        
        db.add_all(products)
        db.flush()  # Populates product IDs for order items
        
        # 2. Seed Customers
        customers = [
            Customer(
                name="Ankit Tiwari",
                email="ankit.tiwari@example.in",
                phone="+91 98765 43210",
                address="42 MG Road, Indiranagar, Bengaluru, Karnataka 560038"
            ),
            Customer(
                name="Hardik Srivastava",
                email="hardik.srivastava@example.in",
                phone="+91 91234 56780",
                address="18 Park Street, Kolkata, West Bengal 700016"
            ),
            Customer(
                name="Vaibhav Singh",
                email="vaibhav.singh@example.in",
                phone="+91 99887 76655",
                address="9 FC Road, Shivajinagar, Pune, Maharashtra 411005"
            ),
            Customer(
                name="Shikhar Gupta",
                email="shikhar.gupta@example.in",
                phone="+91 90909 80808",
                address="27 Civil Lines, Prayagraj, Uttar Pradesh 211001"
            )
        ]
        
        db.add_all(customers)
        db.flush()  # Populates customer IDs for orders
        
        # 3. Seed Orders & OrderItems
        # Order 1: Ankit buys one laptop and one headset
        order1 = Order(
            customer_id=customers[0].id,
            status="confirmed",
            total_amount=Decimal("64489.00")
        )
        db.add(order1)
        db.flush()
        
        order1_items = [
            OrderItem(order_id=order1.id, product_id=products[0].id, quantity=1, unit_price=products[0].price),
            OrderItem(order_id=order1.id, product_id=products[3].id, quantity=1, unit_price=products[3].price)
        ]
        db.add_all(order1_items)
        
        # Deduct stock for Order 1
        products[0].stock_quantity -= 1
        products[3].stock_quantity -= 1
        
        # Order 2: Hardik buys a monitor
        order2 = Order(
            customer_id=customers[1].id,
            status="fulfilled",
            total_amount=Decimal("10499.00")
        )
        db.add(order2)
        db.flush()
        
        order2_items = [
            OrderItem(order_id=order2.id, product_id=products[2].id, quantity=1, unit_price=products[2].price)
        ]
        db.add_all(order2_items)
        
        # Deduct stock for Order 2
        products[2].stock_quantity -= 1

        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
