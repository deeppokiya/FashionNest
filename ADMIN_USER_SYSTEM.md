# 🏪 FashionNest Admin & User System

## 🎯 **System Overview**

FashionNest now has a comprehensive two-tier system:

### 👑 **Admin System**
- **Separate Admin Table**: `admin_users` table for admin authentication
- **Admin Dashboard**: Complete management interface
- **Product Management**: Add, edit, delete products with images
- **Category Management**: Manage product categories
- **Payment Monitoring**: View all payment details
- **Review Management**: Monitor all user reviews
- **Statistics**: Dashboard with key metrics

### 👤 **User System**
- **User Registration/Login**: Standard user authentication
- **Product Browsing**: View and purchase products
- **Review System**: Write reviews for purchased products
- **Profile Management**: Update personal information

## 🗄️ **Database Structure**

### **Admin Table** (`admin_users`)
```sql
- id (Primary Key)
- username (Unique)
- email (Unique)
- password (Hashed)
- first_name
- last_name
- is_active
- is_superuser
- date_joined
- last_login
```

### **User Table** (`users_user`)
```sql
- id (Primary Key)
- username
- email (Unique)
- password (Hashed)
- first_name
- last_name
- phone_number
- address
- city
- state
- zip_code
- country
- date_of_birth
- profile_picture
- date_joined
- last_login
```

## 🔐 **Authentication System**

### **Admin Authentication**
- **JWT Tokens**: Secure token-based authentication
- **Custom Middleware**: `AdminAuthenticationMiddleware`
- **Separate Login**: `/api/admin/auth/login/`
- **Token Payload**: Contains `admin_id`, `admin_email`, `is_admin: true`

### **User Authentication**
- **JWT Tokens**: Standard JWT authentication
- **Django Auth**: Uses Django's built-in authentication
- **Login Endpoint**: `/api/auth/login/`
- **Token Payload**: Contains `user_id`, `user_email`, `is_admin: false`

## 📋 **Admin Features**

### 1. **Admin Dashboard** (`/api/admin/dashboard/`)
```json
{
  "statistics": {
    "total_products": 7,
    "total_categories": 4,
    "total_users": 15,
    "total_orders": 25,
    "total_reviews": 12,
    "total_revenue": 125000.00,
    "monthly_revenue": 25000.00
  },
  "recent_orders": [...],
  "recent_reviews": [...]
}
```

### 2. **Product Management**
- **List Products**: `GET /api/admin/products/`
- **Create Product**: `POST /api/admin/products/`
- **Update Product**: `PUT /api/admin/products/{slug}/`
- **Delete Product**: `DELETE /api/admin/products/{slug}/`
- **Image Upload**: Multiple images with primary image support

### 3. **Category Management**
- **List Categories**: `GET /api/admin/categories/`
- **Create Category**: `POST /api/admin/categories/`
- **Update Category**: `PUT /api/admin/categories/{slug}/`
- **Delete Category**: `DELETE /api/admin/categories/{slug}/`

### 4. **Payment Monitoring**
- **View All Payments**: `GET /api/admin/payments/`
```json
{
  "count": 25,
  "payments": [
    {
      "id": 1,
      "order_number": "FN20240817123456",
      "user_email": "user@example.com",
      "amount": 4999.00,
      "currency": "USD",
      "payment_method": "stripe",
      "status": "completed",
      "transaction_id": "txn_123456",
      "created_at": "2024-08-17T12:34:56Z"
    }
  ]
}
```

### 5. **Review Management**
- **View All Reviews**: `GET /api/admin/reviews/`
```json
{
  "count": 12,
  "reviews": [
    {
      "id": 1,
      "product_name": "Running Shoes",
      "product_slug": "running-shoes",
      "user_email": "user@example.com",
      "user_name": "John Doe",
      "rating": 5,
      "title": "Great product!",
      "comment": "Excellent quality...",
      "is_verified_purchase": true,
      "created_at": "2024-08-17T12:34:56Z"
    }
  ]
}
```

## 👤 **User Features**

### 1. **User Authentication**
- **Register**: `POST /api/auth/register/`
- **Login**: `POST /api/auth/login/`
- **Profile**: `GET /api/auth/profile/`

### 2. **Product Access**
- **Browse Products**: `GET /api/products/`
- **Product Details**: `GET /api/products/{slug}/`
- **Search & Filter**: Built-in search and filtering

### 3. **Shopping Features**
- **Add to Cart**: Cart management
- **Place Orders**: Order creation and payment
- **Order History**: View past orders

### 4. **Review System**
- **Write Reviews**: Only for purchased products
- **Verified Purchases**: Automatic verification
- **One-time Reviews**: Cannot edit after submission

## 🚀 **API Endpoints**

### **Admin Endpoints**
```
POST   /api/admin/auth/register/     # Admin registration
POST   /api/admin/auth/login/        # Admin login
GET    /api/admin/dashboard/         # Admin dashboard
GET    /api/admin/products/          # List all products
POST   /api/admin/products/          # Create product
GET    /api/admin/products/{slug}/   # Get product
PUT    /api/admin/products/{slug}/   # Update product
DELETE /api/admin/products/{slug}/   # Delete product
GET    /api/admin/categories/        # List categories
POST   /api/admin/categories/        # Create category
GET    /api/admin/categories/{slug}/ # Get category
PUT    /api/admin/categories/{slug}/ # Update category
DELETE /api/admin/categories/{slug}/ # Delete category
GET    /api/admin/payments/          # View payments
GET    /api/admin/reviews/           # View reviews
```

### **User Endpoints**
```
POST   /api/auth/register/           # User registration
POST   /api/auth/login/              # User login
GET    /api/auth/profile/            # User profile
GET    /api/products/                # Browse products
GET    /api/products/{slug}/         # Product details
POST   /api/orders/                  # Create order
GET    /api/orders/                  # Order history
POST   /api/payments/confirm/        # Confirm payment
POST   /api/reviews/                 # Write review
```

## 🔧 **Technical Implementation**

### **Custom Middleware**
```python
class AdminAuthenticationMiddleware:
    """Middleware to authenticate admin users from JWT tokens"""
    
    def __call__(self, request):
        # Add admin user to request
        request.admin = SimpleLazyObject(lambda: get_admin_user(request))
        return self.get_response(request)
```

### **Custom Permissions**
```python
class IsAdminUser(permissions.BasePermission):
    """Custom permission to only allow admin users"""
    def has_permission(self, request, view):
        return hasattr(request, 'admin') and request.admin is not None
```

### **JWT Token Structure**
```python
# Admin Token
{
    "admin_id": 1,
    "admin_email": "admin@fashionnest.com",
    "is_admin": true
}

# User Token
{
    "user_id": 1,
    "user_email": "user@example.com",
    "is_admin": false
}
```

## 🎯 **Default Admin Credentials**

```
Email: admin@fashionnest.com
Password: admin123
```

## 📝 **Usage Examples**

### **Admin Login**
```bash
curl -X POST http://localhost:8000/api/admin/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@fashionnest.com",
    "password": "admin123"
  }'
```

### **Create Product (Admin)**
```bash
curl -X POST http://localhost:8000/api/admin/products/ \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: multipart/form-data" \
  -F "name=New Product" \
  -F "description=Product description" \
  -F "price=99.99" \
  -F "category=1" \
  -F "brand=Brand Name" \
  -F "gender=M" \
  -F "stock_quantity=100" \
  -F "images=@product1.jpg" \
  -F "images=@product2.jpg"
```

### **User Registration**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

## 🎉 **System Benefits**

### **For Admins**
- ✅ **Complete Control**: Full product and category management
- ✅ **Payment Monitoring**: Track all transactions
- ✅ **Review Management**: Monitor user feedback
- ✅ **Analytics**: Dashboard with key metrics
- ✅ **Secure Access**: Separate admin authentication

### **For Users**
- ✅ **Easy Shopping**: Browse and purchase products
- ✅ **Review System**: Share feedback on purchases
- ✅ **Profile Management**: Update personal information
- ✅ **Order Tracking**: Monitor order status
- ✅ **Secure Authentication**: JWT-based security

## 🔒 **Security Features**

- **Separate Admin Table**: Isolated admin authentication
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: All passwords are properly hashed
- **Permission System**: Role-based access control
- **Input Validation**: Comprehensive data validation
- **CORS Protection**: Cross-origin request protection

**The FashionNest admin and user system is now fully functional and ready for production use!** 🚀



