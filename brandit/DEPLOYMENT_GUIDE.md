# Brand IT - Deployment Guide

## Project Overview
A dynamic marketplace with stock-market style pricing where product prices increase with demand and crash at peak.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS, Framer Motion, Recharts
- **Backend**: FastAPI, MongoDB, JWT Auth, Razorpay
- **Features**: OTP Auth, Admin Panel, Crash Sales, Buy Now

---

## Local Development Setup

### Prerequisites
- Node.js 18+ and Yarn
- Python 3.11+
- MongoDB (local or Atlas)

### Backend Setup

1. **Create virtual environment**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure environment** (backend/.env)
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="brandit_db"
CORS_ORIGINS="http://localhost:3000"
JWT_SECRET="your-secret-key-change-in-production"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
```

4. **Run backend**
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend Setup

1. **Install dependencies**
```bash
cd frontend
yarn install
```

2. **Configure environment** (frontend/.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

3. **Run frontend**
```bash
yarn start
```

### Initial Data Setup

1. **Create admin user**
```bash
cd scripts
python create_admin.py
```
Default admin: `admin@brandit.com` / `admin123`

2. **Seed products**
```bash
python seed_products.py
```

---

## Production Deployment

### Option 1: Vercel (Frontend) + Railway/Render (Backend)

**Frontend (Vercel):**
1. Push to GitHub
2. Import in Vercel
3. Set environment variable: `REACT_APP_BACKEND_URL`
4. Deploy

**Backend (Railway):**
1. Create new project
2. Add MongoDB service
3. Deploy FastAPI app
4. Set environment variables
5. Copy deployment URL to frontend env

### Option 2: Docker Deployment

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    
  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
    depends_on:
      - mongodb
      
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8001

volumes:
  mongo_data:
```

Run: `docker-compose up -d`

### Option 3: VPS (Ubuntu/Debian)

**Install dependencies:**
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Python & MongoDB
sudo apt install -y python3 python3-pip mongodb

# Nginx
sudo apt install -y nginx
```

**Setup services:**
```bash
# Backend
sudo systemctl enable mongodb
cd /opt/brandit/backend
pip install -r requirements.txt
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8001

# Frontend
cd /opt/brandit/frontend
yarn build
# Serve build folder via Nginx
```

**Nginx config:**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /opt/brandit/frontend/build;
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://localhost:8001;
    }
}
```

---

## Environment Variables Reference

### Backend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| MONGO_URL | MongoDB connection string | mongodb://localhost:27017 |
| DB_NAME | Database name | brandit_db |
| CORS_ORIGINS | Allowed origins | http://localhost:3000 |
| JWT_SECRET | Secret for JWT tokens | random-string-256-bits |
| RAZORPAY_KEY_ID | Razorpay key | rzp_test_xxx |
| RAZORPAY_KEY_SECRET | Razorpay secret | secret_xxx |

### Frontend (.env)
| Variable | Description | Example |
|----------|-------------|---------|
| REACT_APP_BACKEND_URL | Backend API URL | http://localhost:8001 |

---

## API Documentation

### Public Endpoints
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details
- `GET /api/market/stats` - Market statistics
- `POST /api/auth/send-otp` - Send OTP to phone
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/orders/create` - Create order
- `POST /api/orders/verify-payment` - Verify payment

### Admin Endpoints (JWT Required)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/me` - Get profile
- `POST /api/admin/create-admin` - Create new admin
- `POST /api/admin/change-password` - Change password
- `GET /api/admin/all-admins` - List admins
- `POST /api/products` - Create product
- `PUT /api/admin/products/{id}` - Update product
- `DELETE /api/admin/products/{id}` - Delete product
- `POST /api/admin/crash-sale` - Manage crash sales

---

## Features Overview

### Customer Features
- Browse products with dynamic pricing
- Stock ticker-style price display
- Price history charts
- OTP authentication
- Add to cart & Buy now
- Razorpay payment integration
- Order history

### Admin Features
- Product CRUD operations
- Multiple admin accounts
- Password management
- Manual crash sale controls
- Bulk product selection
- Real-time price monitoring

### Dynamic Pricing System
- Price increases by X% per purchase
- Price decreases over time without sales
- Crash sale triggers at max retail price (50% off)
- Manual crash sale override by admin
- Complete price history tracking

---

## Troubleshooting

### Backend won't start
- Check MongoDB is running: `sudo systemctl status mongodb`
- Verify Python version: `python --version` (need 3.11+)
- Check port 8001 is free: `lsof -i :8001`

### Frontend build fails
- Clear cache: `yarn cache clean`
- Delete node_modules: `rm -rf node_modules && yarn install`
- Check Node version: `node --version` (need 18+)

### CORS errors
- Verify CORS_ORIGINS in backend .env
- Check REACT_APP_BACKEND_URL in frontend .env
- Ensure backend is running and accessible

### MongoDB connection issues
- Check connection string format
- Verify MongoDB is running
- Check firewall rules if using remote MongoDB

---

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use strong passwords for admin accounts
- [ ] Enable HTTPS (Let's Encrypt)
- [ ] Set proper CORS_ORIGINS
- [ ] Use environment-specific Razorpay keys
- [ ] Enable MongoDB authentication
- [ ] Set rate limiting on API endpoints
- [ ] Regular security updates

---

## Support

Admin Login: `admin@brandit.com` / `admin123`

For issues, check:
1. Backend logs: `tail -f /var/log/backend.log`
2. Frontend console in browser DevTools
3. MongoDB logs: `sudo journalctl -u mongodb`

---

## License
Proprietary - Brand IT Platform
