# Brand IT - Dynamic Marketplace Platform

A premium digital marketplace with stock-market style dynamic pricing, where product prices increase with demand and crash at peak prices.

## 🚀 Key Features

### Customer Experience
- **Dynamic Pricing**: Prices increase with each purchase, decrease without activity
- **Crash Sales**: Automatic 50% discounts when products hit max price
- **Real-time Updates**: Live price changes and market statistics
- **Multiple Purchase Options**: Add to Cart or Buy Now for instant checkout
- **OTP Authentication**: Secure phone-based login
- **Price History**: Interactive charts showing price trends
- **Responsive Design**: Cyber-finance aesthetic with dark theme

### Admin Dashboard
- **Product Management**: Full CRUD operations with image selection
- **Manual Crash Sales**: Bulk activate/deactivate crash sales on selected products
- **Multi-Admin Support**: Create and manage multiple admin accounts
- **Password Management**: Secure password change functionality
- **Real-time Monitoring**: Track sales volume, crash sales, and product performance
- **JWT Authentication**: Secure admin access with token-based auth

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Tailwind CSS + Custom Design System
- Framer Motion (animations)
- Recharts (price charts)
- Axios
- React Router DOM
- Sonner (toasts)

**Backend:**
- FastAPI
- MongoDB (Motor async driver)
- JWT Authentication
- Bcrypt (password hashing)
- Razorpay Payment Gateway
- Python 3.11+

## 📁 Project Structure

```
/app
├── backend/
│   ├── server.py           # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── custom/    # Custom components
│   │   │   └── ui/        # Shadcn UI components
│   │   ├── pages/         # Route pages
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
└── scripts/
    ├── seed_products.py    # Seed initial products
    └── create_admin.py     # Create admin user
```

## 🎨 Design System

**Colors:**
- Background: `#050505` (Obsidian Black)
- Primary: `#00FF94` (Electric Green)
- Destructive: `#FF3B30` (Neon Red)
- Accent: `#FACC15` (Gold/Yellow)

**Typography:**
- Headings: Chivo (Bold, Black weights)
- Body: Manrope
- Mono/Data: JetBrains Mono

**Theme:** Dark mode with cyber-finance aesthetic, sharp corners, neon accents

## 🔌 API Endpoints

### Public APIs
```
GET    /api/products              # List all products
GET    /api/products/{id}         # Get product details
GET    /api/market/stats          # Market statistics
POST   /api/auth/send-otp         # Send OTP
POST   /api/auth/verify-otp       # Verify OTP
POST   /api/orders/create         # Create order
POST   /api/orders/verify-payment # Verify payment
GET    /api/orders/user/{id}      # User orders
```

### Admin APIs (JWT Protected)
```
POST   /api/admin/login           # Admin login
POST   /api/admin/register        # Register admin
GET    /api/admin/me              # Get profile
GET    /api/admin/all-admins      # List all admins
POST   /api/admin/create-admin    # Create new admin
POST   /api/admin/change-password # Change password
POST   /api/products              # Create product
PUT    /api/admin/products/{id}   # Update product
DELETE /api/admin/products/{id}   # Delete product
POST   /api/admin/crash-sale      # Manage crash sales
```

## 🎯 Dynamic Pricing Algorithm

**Price Increase:**
```
new_price = current_price * (1 + increment_percent / 100)
```

**Automatic Crash Sale Trigger:**
```
if new_price >= max_retail_price:
    crash_sale_active = True
    new_price = max_retail_price * 0.5
```

**Price Decay:**
```
time_since_purchase = hours_elapsed
decrement = price_decrement_rate * (time_since_purchase - 1)
new_price = max(current_price - decrement, base_price * 0.5)
```

## 💾 Database Schema

### Products Collection
```javascript
{
  id: string,
  name: string,
  description: string,
  category: string,
  image_url: string,
  base_price: float,
  current_price: float,
  max_retail_price: float,
  price_increment_percent: float,
  price_decrement_rate: float,
  last_purchase_time: datetime,
  crash_sale_active: boolean,
  purchase_count: integer,
  price_history: [
    { price: float, timestamp: string, event: string }
  ],
  created_at: datetime
}
```

### Admins Collection
```javascript
{
  id: string,
  email: string,
  password_hash: string,
  name: string,
  created_at: datetime
}
```

### Users Collection
```javascript
{
  id: string,
  phone_number: string,
  email: string,
  otp: string,
  otp_expiry: datetime,
  verified: boolean,
  created_at: datetime
}
```

### Orders Collection
```javascript
{
  id: string,
  user_id: string,
  email: string,
  products: array,
  total_amount: float,
  razorpay_order_id: string,
  razorpay_payment_id: string,
  payment_status: string,
  created_at: datetime
}
```

## 🔐 Admin Credentials

**Default Admin:**
- Email: `admin@brandit.com`
- Password: `admin123`

**Admin Panel:** `/admin/login`

## 🚦 Getting Started

1. **Install dependencies:**
```bash
cd backend && pip install -r requirements.txt
cd ../frontend && yarn install
```

2. **Configure environment:**
- Update `backend/.env` with MongoDB URL
- Update `frontend/.env` with backend URL

3. **Seed data:**
```bash
python scripts/create_admin.py
python scripts/seed_products.py
```

4. **Run services:**
```bash
# Backend (Terminal 1)
cd backend && uvicorn server:app --reload --port 8001

# Frontend (Terminal 2)
cd frontend && yarn start
```

5. **Access:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- Admin Panel: http://localhost:3000/admin/login

## 📝 Environment Variables

**Backend (.env):**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=brandit_db
CORS_ORIGINS=http://localhost:3000
JWT_SECRET=your-secret-key
RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

**Frontend (.env):**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🧪 Testing

- Manual testing completed with screenshots
- OTP authentication tested
- Admin panel CRUD operations verified
- Crash sale functionality confirmed
- Payment flow UI tested (Razorpay keys pending)

## 📦 Dependencies

**Backend:**
- fastapi==0.110.1
- motor==3.3.1 (MongoDB async)
- pyjwt (JWT tokens)
- bcrypt==4.1.3 (password hashing)
- razorpay==2.0.0
- passlib, python-jose, python-multipart

**Frontend:**
- react@19.0.0
- framer-motion@12.34.2
- recharts@3.6.0
- react-razorpay@3.0.1
- sonner@2.0.3 (toasts)
- lucide-react@0.507.0 (icons)
- Shadcn UI components

## 🎯 Future Enhancements

- [ ] Scheduled crash sales
- [ ] Crash sale history/analytics
- [ ] Admin role levels (super admin vs regular)
- [ ] Delete/disable admin accounts
- [ ] Bulk product import (CSV/JSON)
- [ ] Email notifications for crash sales
- [ ] Real-time WebSocket price updates
- [ ] Product reviews/ratings
- [ ] Advanced search filters
- [ ] Sales reports and analytics

## 📄 License

Proprietary - Brand IT Platform

## 🤝 Support

For deployment help, see `DEPLOYMENT_GUIDE.md`

---

Built with ❤️ for Brand IT
