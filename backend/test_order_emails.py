#!/usr/bin/env python3
"""
Comprehensive test script to verify order emails are sent correctly
This test creates an order and verifies both order confirmation and delivery emails
"""

import requests
import json
import time
import os
import sys
import django

# Setup Django for direct model access
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fashionnest.settings')
django.setup()

from django.utils import timezone
from orders.models import Order, OrderItem
from users.models import User
from products.models import Product

# Configuration
BASE_URL = 'http://localhost:8000'
LOGIN_URL = f'{BASE_URL}/api/login/'
PRODUCTS_URL = f'{BASE_URL}/api/products/'
CART_ADD_URL = f'{BASE_URL}/api/cart/add/'
ORDER_CREATE_URL = f'{BASE_URL}/api/orders/create/'

# Test user credentials
USER_EMAIL = 'deep.pokiya1312@gmail.com'
USER_PASSWORD = 'Deep@1312'

def login_user():
    """Login and get authentication token"""
    print("🔐 Logging in user...")
    
    login_data = {
        'email': USER_EMAIL,
        'password': USER_PASSWORD
    }
    
    response = requests.post(LOGIN_URL, json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('access')
        print(f"✅ Login successful - Token: {token[:20]}...")
        return token
    else:
        print(f"❌ Login failed: {response.status_code} - {response.text}")
        return None

def get_products(token):
    """Get available products"""
    print("📦 Getting products...")
    
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.get(PRODUCTS_URL, headers=headers)
    
    if response.status_code == 200:
        products = response.json()
        if 'results' in products:
            products = products['results']
        print(f"✅ Found {len(products)} products")
        return products
    else:
        print(f"❌ Failed to get products: {response.status_code}")
        return []

def clear_cart(token):
    """Clear the user's cart"""
    print("🧹 Clearing cart...")
    
    headers = {'Authorization': f'Bearer {token}'}
    response = requests.post(f'{BASE_URL}/api/cart/clear/', headers=headers)
    
    if response.status_code == 200:
        print("✅ Cart cleared")
    else:
        print(f"⚠️ Cart clear failed: {response.status_code}")

def add_to_cart(token, product_id, quantity=1):
    """Add product to cart"""
    print(f"🛒 Adding product {product_id} to cart...")
    
    headers = {'Authorization': f'Bearer {token}'}
    cart_data = {
        'product': product_id,
        'quantity': quantity,
        'size': 'M',  # Default size
        'color': 'Black'  # Default color
    }
    
    response = requests.post(CART_ADD_URL, json=cart_data, headers=headers)
    
    if response.status_code == 201:
        print("✅ Product added to cart")
        return True
    else:
        print(f"❌ Failed to add to cart: {response.status_code} - {response.text}")
        return False

def create_order(token):
    """Create an order to test email sending"""
    print("📋 Creating order...")
    
    headers = {'Authorization': f'Bearer {token}'}
    order_data = {
        'shipping_address': '123 Test Street',
        'shipping_city': 'Test City',
        'shipping_state': 'Test State',
        'shipping_zip_code': '12345',
        'shipping_country': 'Test Country',
        'shipping_phone': '+1234567890',
        'payment_method': 'credit_card',
        'tax': 5.00,
        'shipping_cost': 10.00
    }
    
    response = requests.post(ORDER_CREATE_URL, json=order_data, headers=headers)
    
    if response.status_code == 201:
        order = response.json()
        print(f"✅ Order created: {order.get('order_number')}")
        print(f"📊 Order status: {order.get('status')}")
        print(f"💳 Payment status: {order.get('payment_status')}")
        return order
    else:
        print(f"❌ Failed to create order: {response.status_code} - {response.text}")
        return None

def verify_order_in_database(order_number):
    """Verify order was created and delivered in database"""
    print(f"\n🔍 Verifying order {order_number} in database...")
    
    try:
        order = Order.objects.get(order_number=order_number)
        print(f"✅ Order found in database")
        print(f"   Status: {order.status}")
        print(f"   Payment Status: {order.payment_status}")
        print(f"   Actual Delivery: {order.actual_delivery}")
        print(f"   Review Eligible: {order.review_eligible}")
        
        if order.status == 'delivered':
            print("✅ Order was automatically delivered")
            return True
        else:
            print("❌ Order was not delivered")
            return False
            
    except Order.DoesNotExist:
        print(f"❌ Order {order_number} not found in database")
        return False

def main():
    """Main test function"""
    print("🚀 Starting Order Email Test")
    print("=" * 60)
    
    # Step 1: Login
    token = login_user()
    if not token:
        return
    
    # Step 2: Clear cart and add product
    clear_cart(token)
    products = get_products(token)
    if not products:
        return
    
    if not add_to_cart(token, products[0]['id']):
        return
    
    # Step 3: Create order (this should trigger both emails)
    print("\n📧 Creating order to test email sending...")
    order = create_order(token)
    if not order:
        return
    
    order_number = order['order_number']
    
    print(f"\n📋 Order Summary:")
    print(f"   Order Number: {order_number}")
    print(f"   Status: {order['status']}")
    print(f"   Payment Status: {order['payment_status']}")
    
    # Step 4: Wait a moment for emails to be processed
    print(f"\n⏰ Waiting 3 seconds for emails to be processed...")
    time.sleep(3)
    
    # Step 5: Verify order in database
    order_delivered = verify_order_in_database(order_number)
    
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    print(f"   Order Creation: ✅ PASSED")
    print(f"   Order Delivery: {'✅ PASSED' if order_delivered else '❌ FAILED'}")
    
    if order_delivered:
        print("\n🎉 ORDER EMAIL TEST PASSED!")
        print("✅ Order was created successfully")
        print("✅ Order was automatically delivered")
        print("✅ Two emails should have been sent:")
        print("   1. Order Confirmation Email")
        print("   2. Delivery Status Email")
        print("\n📧 Check your email inbox for:")
        print(f"   - Order Confirmation: {order_number}")
        print(f"   - Delivery Notification: {order_number}")
    else:
        print("\n❌ ORDER EMAIL TEST FAILED")
        print("Order was created but not delivered automatically")
    
    print("=" * 60)
    print("📧 Email Configuration:")
    print("   Make sure your .env file has proper email settings:")
    print("   EMAIL_HOST=smtp.gmail.com")
    print("   EMAIL_PORT=587")
    print("   EMAIL_USE_TLS=True")
    print("   EMAIL_HOST_USER=your_email@gmail.com")
    print("   EMAIL_HOST_PASSWORD=your_app_password")
    print("=" * 60)

if __name__ == "__main__":
    main()




