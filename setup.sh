#!/bin/bash

echo "🚀 Setting up FashionNest E-commerce Platform..."

# Create virtual environment for Django
echo "📦 Setting up Django backend..."
cd backend
python3 -m venv venv
source venv/bin/activate

# Install Django dependencies
pip install -r requirements.txt

# Copy environment file
cp env.example .env

# Run Django migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
echo "👤 Creating superuser..."
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

cd ..

# Setup React frontend
echo "⚛️ Setting up React frontend..."
cd frontend

# Install Node.js dependencies
npm install

# Copy environment file
cp env.example .env

cd ..

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update environment files with your actual API keys and settings"
echo "2. Start the Django backend: cd backend && python manage.py runserver"
echo "3. Start the React frontend: cd frontend && npm start"
echo "4. Access the admin panel at http://localhost:8000/admin"
echo "5. Access the frontend at http://localhost:3000"
echo ""
echo "🔧 Additional setup:"
echo "- Install and start Redis for Celery: brew install redis && redis-server"
echo "- Start Celery worker: cd backend && celery -A fashionnest worker -l info"
echo "- Start Celery beat: cd backend && celery -A fashionnest beat -l info" 