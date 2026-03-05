#!/usr/bin/env python
"""
Script to create a default admin user
"""

import os
import sys
import django

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fashionnest.settings')
django.setup()

from users.models import Admin
from django.contrib.auth.hashers import make_password

def create_default_admin():
    """Create a default admin user"""
    
    # Check if admin already exists
    if Admin.objects.filter(username='admin').exists():
        print("✅ Admin user 'admin' already exists!")
        return
    
    # Create default admin
    admin = Admin.objects.create(
        username='admin',
        email='admin@fashionnest.com',
        password=make_password('admin123'),  # Default password
        first_name='Admin',
        last_name='User',
        is_active=True,
        is_superuser=True
    )
    
    print(f"✅ Default admin user created successfully!")
    print(f"   Username: {admin.username}")
    print(f"   Email: {admin.email}")
    print(f"   Password: admin123")
    print(f"   Full Name: {admin.get_full_name()}")
    print(f"   Superuser: {admin.is_superuser}")

if __name__ == '__main__':
    create_default_admin()
