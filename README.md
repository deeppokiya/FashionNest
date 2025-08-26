# FashionNest
FashionNest is a Full-Stack E-Commerce Website built with React (frontend) and Django + Python (backend). It allows users to explore, buy, and review clothing and accessories for men and women with a smooth and secure shopping experience.


# FashionNest - Full Stack E-commerce Platform

A modern e-commerce platform built with Django (Backend) and React (Frontend) for fashion products.

## Features

- **Product Management**: Add, edit, and manage fashion products
- **Shopping Cart**: Add products to cart with quantity management
- **User Authentication**: Register, login, and user profile management
- **Checkout Process**: Address input, order summary, and payment processing
- **Payment Integration**: Multiple payment methods (Stripe, PayPal)
- **Order Management**: Order history, tracking, and status updates
- **Email Notifications**: Order confirmation emails using NodeMailer
- **Admin Panel**: Django admin for product and order management
- **Responsive Design**: Mobile-friendly UI

## Tech Stack

### Backend (Django)
- Django 4.2+
- Django REST Framework
- Django CORS Headers
- Stripe for payments
- PostgreSQL/SQLite
- Celery for background tasks

### Frontend (React)
- React 18
- React Router
- Redux Toolkit
- Axios for API calls
- Material-UI or Tailwind CSS
- React Hook Form

## Project Structure

```
FashionNest/
├── backend/                 # Django backend
│   ├── fashionnest/        # Main Django project
│   ├── products/           # Product management app
│   ├── orders/            # Order management app
│   ├── users/             # User management app
│   ├── payments/          # Payment processing app
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── redux/        # Redux store
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── package.json
└── README.md
```

## Installation & Setup

### Backend Setup
1. Navigate to backend directory
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Run migrations: `python manage.py migrate`
6. Create superuser: `python manage.py createsuperuser`
7. Run server: `python manage.py runserver`

### Frontend Setup
1. Navigate to frontend directory
2. Install dependencies: `npm install`
3. Start development server: `npm start`

## Environment Variables

Create `.env` files in both backend and frontend directories:

### Backend (.env)
```
SECRET_KEY=your_django_secret_key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## API Endpoints

- `GET /api/products/` - List all products
- `POST /api/products/` - Create new product
- `GET /api/products/{id}/` - Get product details
- `POST /api/cart/add/` - Add item to cart
- `GET /api/cart/` - Get cart items
- `POST /api/orders/` - Create order
- `GET /api/orders/` - Get user orders
- `POST /api/payments/` - Process payment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License 
