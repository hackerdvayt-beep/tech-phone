# E-Commerce MERN App

A full-stack e-commerce application built with MongoDB, Express.js, React.js, and Node.js featuring comprehensive admin functionality and order management.

## **Features**

**Customer Features**
- Product browsing with search & filtering
- Shopping cart & order management
- User authentication & profile management
- Bank QR transfer, cash on delivery, installment consultation, MoMo and PayPal checkout options
- Responsive mobile-friendly design

**Admin Features**
- Product management (CRUD operations)
- Order management & delivery tracking
- User management
- Image upload & inventory tracking

## **Tech Stack**

**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Multer  
**Frontend:** React.js, Redux, React Bootstrap, React Router, Axios

### **Images**
User views: 
<img src="https://github.com/k1enn/levents_shop/blob/master/frontend/public/images/user_view.png?raw=true">
Admin view: 
<img src="https://github.com/k1enn/levents_shop/blob/master/frontend/public/images/admin_view.png?raw=true">

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/k1enn/levents_shop.git
   cd proshop
   npm install
   cd frontend && npm install && cd ..
   ```

2. **Environment Setup**
   Create `.env` file in root:
   ```env
   MONGO_URI=YOUR_MONGO_URI
   PORT=5000
   JWT_SECRET=abc123
   NODE_ENV=development
   MOMO_ACCESS_KEY=F8BBA842ECF85
   MOMO_SECRET_KEY=K951B6PE1waDMi640xX08PD3vg6EkVlz
   MOMO_PARTNER_CODE=MOMO
   MOMO_REDIRECT_URL=http://localhost:3000/order-success
   MOMO_IPN_URL=http://localhost:5000/api/payment/momo/ipn
   BANK_QR_BANK_CODE=YOUR_BANK_CODE
   BANK_QR_ACCOUNT=YOUR_ACCOUNT_NUMBER
   BANK_QR_ACCOUNT_NAME=YOUR_ACCOUNT_NAME
   ```
   Replace the `BANK_QR_*` placeholders with the public bank transfer details used to generate VietQR payment codes. Do not commit the configured `.env` file.

3. **Database Setup**
   ```bash
   npm run data:import
   ```

4. **Start Application**
   ```bash
   npm run dev  # Runs both frontend & backend
   ```

## **Project Structure**

```
├── backend/          # Express.js API
│   ├── controllers/  # Route handlers
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   └── middleware/   # Auth & error handling
├── frontend/         # React.js app
│   └── src/
│       ├── components/  # Reusable components
│       ├── screens/     # Page components
│       ├── actions/     # Redux actions
│       └── reducers/    # Redux reducers
└── uploads/          # Image storage
```

## 🔧 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `DELETE /api/products/:id?force=true` - Force delete with orders (Admin)

### Users
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/myorders` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id/pay` - Mark order as paid
- `PUT /api/orders/:id/deliver` - Mark order as delivered (Admin)
- `GET /api/payment/bank/config` - Get public bank transfer details for QR payments
- `POST /api/installment-requests` - Save an installment consultation request (authenticated)
- `GET /api/installment-requests/admin` - List the latest 100 installment requests (Admin)
- `PUT /api/installment-requests/:id/status` - Update a request status (Admin)

Admins can review requests at `/admin/installment-requests`. Installment quotes are calculated from current product, variant, stock, and sale data in the database; a changed client price is rejected and must be refreshed.

### Upload
- `POST /api/upload` - Upload image

## 🔐 Authentication

Uses JWT tokens for authentication. Admin routes require `isAdmin: true` in user profile.

**Create Admin User:**
1. Register normally
2. Update user's `isAdmin` field to `true` in database
3. Or use seeder script: `npm run data:import`

## 📱 Available Scripts

```bash
npm run dev          # Start both frontend & backend
npm run server       # Backend only
npm run client       # Frontend only
npm run data:import  # Import sample data
npm run data:sync-products # Add/update catalog products without deleting existing data
npm run data:destroy # Clear database
```
