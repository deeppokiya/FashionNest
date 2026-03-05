#!/usr/bin/env python
"""
Test script for automatic order delivery functionality
"""
import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fashionnest.settings')
django.setup()

from django.utils import timezone
from orders.models import Order
from orders.tasks import auto_update_order_status, send_review_reminders_batch
from users.models import User
from products.models import Product, Category

def test_auto_delivery():
    """Test the automatic order delivery functionality"""
    print("🧪 Testing Automatic Order Delivery System")
    print("=" * 50)
    
    # Check if we have any users and products
    users = User.objects.all()
    products = Product.objects.all()
    
    if not users.exists():
        print("❌ No users found. Please create a user first.")
        return
    
    if not products.exists():
        print("❌ No products found. Please create products first.")
        return
    
    user = users.first()
    product = products.first()
    
    print(f"👤 Using user: {user.email}")
    print(f"🛍️ Using product: {product.name}")
    
    # Create a test order that's 6 minutes old (should be auto-delivered)
    old_time = timezone.now() - timedelta(minutes=6)
    
    # Check if user has a cart
    from orders.models import Cart, CartItem
    cart, created = Cart.objects.get_or_create(user=user)
    
    # Add item to cart
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        defaults={'quantity': 1}
    )
    
    # Create order
    order_data = {
        'user': user,
        'subtotal': product.current_price,
        'tax': 0,
        'shipping_cost': 0,
        'total_amount': product.current_price,
        'payment_method': 'credit_card',
        'payment_status': 'completed',
        'shipping_address': '123 Test St',
        'shipping_city': 'Test City',
        'shipping_state': 'Test State',
        'shipping_zip_code': '12345',
        'shipping_country': 'Test Country',
        'shipping_phone': '123-456-7890',
    }
    
    order = Order.objects.create(**order_data)
    
    # Manually set the created_at to 6 minutes ago
    order.created_at = old_time
    order.save()
    
    print(f"📦 Created test order: {order.order_number}")
    print(f"⏰ Order created at: {order.created_at}")
    print(f"📊 Order status: {order.status}")
    print(f"💳 Payment status: {order.payment_status}")
    
    # Run the auto-delivery task
    print("\n🔄 Running auto-delivery task...")
    result = auto_update_order_status()
    print(f"✅ Task result: {result}")
    
    # Refresh the order
    order.refresh_from_db()
    print(f"📊 Updated order status: {order.status}")
    print(f"📅 Actual delivery: {order.actual_delivery}")
    print(f"✍️ Review eligible: {order.review_eligible}")
    
    if order.status == 'delivered':
        print("🎉 SUCCESS: Order was automatically delivered!")
    else:
        print("❌ FAILED: Order was not delivered")
    
    # Test review reminder
    print("\n📧 Testing review reminder...")
    reminder_result = send_review_reminders_batch()
    print(f"📧 Reminder result: {reminder_result}")
    
    print("\n" + "=" * 50)
    print("✅ Test completed!")

if __name__ == "__main__":
    test_auto_delivery()














