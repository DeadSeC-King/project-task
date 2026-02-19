from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import random
import razorpay
import hmac
import hashlib
import jwt
from passlib.hash import bcrypt

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

razorpay_key_id = os.environ.get('RAZORPAY_KEY_ID', '')
razorpay_key_secret = os.environ.get('RAZORPAY_KEY_SECRET', '')
razorpay_client = razorpay.Client(auth=(razorpay_key_id, razorpay_key_secret)) if razorpay_key_id else None

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'

security = HTTPBearer()

class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str
    image_url: str
    base_price: float
    current_price: float
    max_retail_price: float
    price_increment_percent: float = 5.0
    price_decrement_rate: float = 0.5
    last_purchase_time: Optional[datetime] = None
    crash_sale_active: bool = False
    purchase_count: int = 0
    price_history: List[dict] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(BaseModel):
    name: str
    description: str
    category: str
    image_url: str
    base_price: float
    max_retail_price: float
    price_increment_percent: float = 5.0

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    base_price: Optional[float] = None
    max_retail_price: Optional[float] = None
    price_increment_percent: Optional[float] = None

class Admin(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    password_hash: str
    name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    email: EmailStr
    password: str

class AdminCreate(BaseModel):
    email: EmailStr
    password: str
    name: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phone_number: str
    email: Optional[str] = None
    name: Optional[str] = None
    otp: Optional[str] = None
    otp_expiry: Optional[datetime] = None
    verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SendOTPRequest(BaseModel):
    phone_number: str

class VerifyOTPRequest(BaseModel):
    phone_number: str
    otp: str

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    email: EmailStr
    products: List[dict]
    total_amount: float
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    payment_status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreateOrderRequest(BaseModel):
    user_id: str
    email: EmailStr
    products: List[dict]

class VerifyPaymentRequest(BaseModel):
    order_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

def create_jwt_token(admin_id: str, email: str) -> str:
    payload = {
        'admin_id': admin_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        admin_id = payload.get('admin_id')
        
        admin = await db.admins.find_one({'id': admin_id}, {'_id': 0})
        if not admin:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return admin
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def update_product_price(product_id: str, purchased: bool = False):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        return
    
    if purchased:
        new_price = product['current_price'] * (1 + product['price_increment_percent'] / 100)
        if new_price >= product['max_retail_price']:
            product['crash_sale_active'] = True
            new_price = product['max_retail_price'] * 0.5
            product['current_price'] = new_price
        else:
            product['current_price'] = new_price
        
        product['purchase_count'] = product['purchase_count'] + 1
        product['last_purchase_time'] = datetime.now(timezone.utc).isoformat()
        
        product['price_history'].append({
            "price": new_price,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event": "crash_sale" if product['crash_sale_active'] else "purchase"
        })
        
        await db.products.update_one(
            {"id": product_id},
            {"$set": product}
        )
    else:
        if product.get('last_purchase_time'):
            last_purchase = datetime.fromisoformat(product['last_purchase_time'])
            time_since_purchase = (datetime.now(timezone.utc) - last_purchase).total_seconds() / 3600
            
            if time_since_purchase > 1:
                decrement = product['price_decrement_rate'] * (time_since_purchase - 1)
                new_price = max(
                    product['current_price'] - decrement,
                    product['base_price'] * 0.5
                )
                
                if new_price != product['current_price']:
                    product['current_price'] = new_price
                    product['price_history'].append({
                        "price": new_price,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "event": "decay"
                    })
                    await db.products.update_one(
                        {"id": product_id},
                        {"$set": product}
                    )

@api_router.get("/")
async def root():
    return {"message": "Digital Exchange API"}

@api_router.post("/admin/register")
async def register_admin(admin_input: AdminCreate):
    existing = await db.admins.find_one({"email": admin_input.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Admin already exists")
    
    password_hash = bcrypt.hash(admin_input.password)
    admin = Admin(
        email=admin_input.email,
        password_hash=password_hash,
        name=admin_input.name
    )
    
    doc = admin.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.admins.insert_one(doc)
    
    token = create_jwt_token(admin.id, admin.email)
    return {"message": "Admin created", "token": token, "admin": {"id": admin.id, "email": admin.email, "name": admin.name}}

@api_router.post("/admin/login")
async def login_admin(login_data: AdminLogin):
    admin = await db.admins.find_one({"email": login_data.email}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.verify(login_data.password, admin['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(admin['id'], admin['email'])
    return {"token": token, "admin": {"id": admin['id'], "email": admin['email'], "name": admin['name']}}

@api_router.get("/admin/me")
async def get_admin_profile(admin = Depends(verify_admin_token)):
    return {"id": admin['id'], "email": admin['email'], "name": admin['name']}

@api_router.post("/admin/create-admin")
async def create_new_admin(admin_input: AdminCreate, current_admin = Depends(verify_admin_token)):
    existing = await db.admins.find_one({"email": admin_input.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Admin with this email already exists")
    
    password_hash = bcrypt.hash(admin_input.password)
    new_admin = Admin(
        email=admin_input.email,
        password_hash=password_hash,
        name=admin_input.name
    )
    
    doc = new_admin.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.admins.insert_one(doc)
    
    return {"message": "Admin created successfully", "admin": {"id": new_admin.id, "email": new_admin.email, "name": new_admin.name}}

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@api_router.post("/admin/change-password")
async def change_admin_password(request: ChangePasswordRequest, admin = Depends(verify_admin_token)):
    if not bcrypt.verify(request.current_password, admin['password_hash']):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    
    new_password_hash = bcrypt.hash(request.new_password)
    
    await db.admins.update_one(
        {"id": admin['id']},
        {"$set": {"password_hash": new_password_hash}}
    )
    
    return {"message": "Password changed successfully"}

@api_router.get("/admin/all-admins")
async def get_all_admins(admin = Depends(verify_admin_token)):
    admins = await db.admins.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return admins

@api_router.delete("/admin/delete-admin/{admin_id}")
async def delete_admin(admin_id: str, current_admin = Depends(verify_admin_token)):
    if admin_id == current_admin['id']:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    result = await db.admins.delete_one({"id": admin_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    return {"message": "Admin deleted successfully"}

@api_router.post("/auth/send-otp")
async def send_otp(request: SendOTPRequest):
    otp = str(random.randint(100000, 999999))
    otp_expiry = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    existing_user = await db.users.find_one({"phone_number": request.phone_number}, {"_id": 0})
    
    if existing_user:
        await db.users.update_one(
            {"phone_number": request.phone_number},
            {"$set": {"otp": otp, "otp_expiry": otp_expiry.isoformat()}}
        )
    else:
        user = User(
            phone_number=request.phone_number,
            otp=otp,
            otp_expiry=otp_expiry
        )
        doc = user.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        if doc.get('otp_expiry'):
            doc['otp_expiry'] = doc['otp_expiry'].isoformat()
        await db.users.insert_one(doc)
    
    return {"message": "OTP sent successfully", "otp": otp}

@api_router.post("/auth/verify-otp")
async def verify_otp(request: VerifyOTPRequest):
    user = await db.users.find_one({"phone_number": request.phone_number}, {"_id": 0})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user['otp'] != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    otp_expiry = datetime.fromisoformat(user['otp_expiry'])
    if datetime.now(timezone.utc) > otp_expiry:
        raise HTTPException(status_code=400, detail="OTP expired")
    
    await db.users.update_one(
        {"phone_number": request.phone_number},
        {"$set": {"verified": True, "otp": None, "otp_expiry": None}}
    )
    
    user['verified'] = True
    return {"message": "OTP verified successfully", "user": user}

@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    for product in products:
        if isinstance(product.get('created_at'), str):
            product['created_at'] = datetime.fromisoformat(product['created_at'])
        if product.get('last_purchase_time') and isinstance(product['last_purchase_time'], str):
            product['last_purchase_time'] = datetime.fromisoformat(product['last_purchase_time'])
    return products

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if isinstance(product.get('created_at'), str):
        product['created_at'] = datetime.fromisoformat(product['created_at'])
    if product.get('last_purchase_time') and isinstance(product['last_purchase_time'], str):
        product['last_purchase_time'] = datetime.fromisoformat(product['last_purchase_time'])
    
    return product

@api_router.post("/products", response_model=Product)
async def create_product(product_input: ProductCreate):
    product = Product(
        **product_input.model_dump(),
        current_price=product_input.base_price
    )
    
    doc = product.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    if doc.get('last_purchase_time'):
        doc['last_purchase_time'] = doc['last_purchase_time'].isoformat()
    
    await db.products.insert_one(doc)
    return product

@api_router.put("/admin/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_update: ProductUpdate, admin = Depends(verify_admin_token)):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = {k: v for k, v in product_update.model_dump().items() if v is not None}
    
    if 'base_price' in update_data:
        update_data['current_price'] = update_data['base_price']
        update_data['crash_sale_active'] = False
        update_data['purchase_count'] = 0
        update_data['price_history'] = []
    
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    updated_product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if isinstance(updated_product.get('created_at'), str):
        updated_product['created_at'] = datetime.fromisoformat(updated_product['created_at'])
    if updated_product.get('last_purchase_time') and isinstance(updated_product['last_purchase_time'], str):
        updated_product['last_purchase_time'] = datetime.fromisoformat(updated_product['last_purchase_time'])
    
    return updated_product

@api_router.delete("/admin/products/{product_id}")
async def delete_product(product_id: str, admin = Depends(verify_admin_token)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

class CrashSaleRequest(BaseModel):
    product_ids: List[str]
    activate: bool

@api_router.post("/admin/crash-sale")
async def manage_crash_sale(request: CrashSaleRequest, admin = Depends(verify_admin_token)):
    if not request.product_ids:
        raise HTTPException(status_code=400, detail="No products selected")
    
    for product_id in request.product_ids:
        product = await db.products.find_one({"id": product_id}, {"_id": 0})
        if not product:
            continue
        
        if request.activate:
            crash_price = product['max_retail_price'] * 0.5
            update_data = {
                "crash_sale_active": True,
                "current_price": crash_price
            }
            
            product['price_history'].append({
                "price": crash_price,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event": "manual_crash_sale"
            })
            update_data['price_history'] = product['price_history']
        else:
            update_data = {
                "crash_sale_active": False,
                "current_price": product['base_price']
            }
            
            product['price_history'].append({
                "price": product['base_price'],
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "event": "crash_sale_ended"
            })
            update_data['price_history'] = product['price_history']
        
        await db.products.update_one({"id": product_id}, {"$set": update_data})
    
    action = "activated" if request.activate else "deactivated"
    return {"message": f"Crash sale {action} for {len(request.product_ids)} product(s)"}

@api_router.post("/orders/create")
async def create_order(request: CreateOrderRequest):
    total_amount = sum(item['price'] * item['quantity'] for item in request.products)
    
    if razorpay_client:
        razorpay_order = razorpay_client.order.create({
            "amount": int(total_amount * 100),
            "currency": "INR",
            "payment_capture": 1
        })
        razorpay_order_id = razorpay_order['id']
    else:
        razorpay_order_id = f"order_{uuid.uuid4().hex[:12]}"
    
    order = Order(
        user_id=request.user_id,
        email=request.email,
        products=request.products,
        total_amount=total_amount,
        razorpay_order_id=razorpay_order_id
    )
    
    doc = order.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.orders.insert_one(doc)
    
    return {
        "order_id": order.id,
        "razorpay_order_id": razorpay_order_id,
        "amount": total_amount,
        "key_id": razorpay_key_id
    }

@api_router.post("/orders/verify-payment")
async def verify_payment(request: VerifyPaymentRequest, background_tasks: BackgroundTasks):
    order = await db.orders.find_one({"id": request.order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if razorpay_client:
        signature_payload = f"{request.razorpay_order_id}|{request.razorpay_payment_id}"
        expected_signature = hmac.new(
            razorpay_key_secret.encode(),
            signature_payload.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if expected_signature != request.razorpay_signature:
            raise HTTPException(status_code=400, detail="Invalid payment signature")
    
    await db.orders.update_one(
        {"id": request.order_id},
        {"$set": {
            "razorpay_payment_id": request.razorpay_payment_id,
            "payment_status": "completed"
        }}
    )
    
    for product in order['products']:
        background_tasks.add_task(update_product_price, product['id'], purchased=True)
    
    return {"message": "Payment verified successfully", "status": "completed"}

@api_router.get("/orders/user/{user_id}")
async def get_user_orders(user_id: str):
    orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    for order in orders:
        if isinstance(order.get('created_at'), str):
            order['created_at'] = datetime.fromisoformat(order['created_at'])
    return orders

@api_router.get("/market/stats")
async def get_market_stats():
    products = await db.products.find({}, {"_id": 0}).to_list(1000)
    
    if not products:
        return {
            "total_products": 0,
            "crash_sales_active": 0,
            "avg_price_change": 0,
            "total_volume": 0
        }
    
    crash_sales = sum(1 for p in products if p.get('crash_sale_active'))
    total_volume = sum(p.get('purchase_count', 0) for p in products)
    
    return {
        "total_products": len(products),
        "crash_sales_active": crash_sales,
        "total_volume": total_volume
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()