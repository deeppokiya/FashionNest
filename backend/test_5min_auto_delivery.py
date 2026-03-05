#!/usr/bin/env python
"""
Test script for 5-minute auto-delivery system
This script will:
1. Create a test order with 'pending' status
2. Wait for the auto-delivery task to run
3. Verify the order status changes to 'delivered'
"""

import os
import sys
import django
import time
from datetime import timedelta

# Add the project directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fashionnest.settings')
django.setup()

from django.utils import timezone
from orders.models import Order, OrderItem
from products.models import Product
from users.models import User
from orders.tasks import auto_update_order_status

def test_5min_auto_delivery():
    print("🧪 Testing 5-minute auto-delivery system")
    print("=" * 50)
    
    # Get or create a test user
    try:
        user = User.objects.get(email='test@example.com')
    except User.DoesNotExist:
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        print(f"✅ Created test user: {user.email}")
    
    # Get a test product
    try:
        product = Product.objects.first()
        if not product:
            print("❌ No products found in database")
            return
        print(f"✅ Using product: {product.name}")
    except Exception as e:
        print(f"❌ Error getting product: {str(e)}")
        return
    
    # Create a test order with 'pending' status and old timestamp (5+ minutes ago)
    old_timestamp = timezone.now() - timedelta(minutes=6)
    
    # Override the created_at field after creation
    order = Order.objects.create(
        user=user,
        order_number=f"TEST-{int(time.time())}",
        subtotal=product.current_price,
        tax=0,
        shipping_cost=0,
        total_amount=product.current_price,
        status='pending',  # Start with pending status
        payment_status='completed',  # Payment completed
        shipping_address="123 Test St",
        shipping_city="Test City",
        shipping_state="TC",
        shipping_zip_code="12345",
        shipping_country="Test Country",
        shipping_phone="1234567890",
        payment_method="credit_card"
    )
    
    # Manually set the created_at to 6 minutes ago
    order.created_at = old_timestamp
    order.save(update_fields=['created_at'])
    
    try:
        # Order is already created above, just create the order item
        
        # Create order item
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=1,
            price=product.current_price,
            size='M',
            color='Blue'
        )
        
        print(f"✅ Created test order: {order.order_number}")
        print(f"   Status: {order.status}")
        print(f"   Payment Status: {order.payment_status}")
        print(f"   Created: {order.created_at}")
        print(f"   Age: {timezone.now() - order.created_at}")
        
    except Exception as e:
        print(f"❌ Error creating order: {str(e)}")
        return
    
    # Check initial status
    print(f"\n📋 Initial order status: {order.status}")
    
    # Run the auto-delivery task manually
    print(f"\n🔄 Running auto-delivery task...")
    result = auto_update_order_status()
    print(f"📊 Task result: {result}")
    
    # Refresh order from database
    order.refresh_from_db()
    
    # Check final status
    print(f"\n📋 Final order status: {order.status}")
    if order.actual_delivery:
        print(f"📦 Delivery time: {order.actual_delivery}")
    print(f"⭐ Review eligible: {order.review_eligible}")
    
    # Verify the result
    if order.status == 'delivered':
        print(f"\n🎉 SUCCESS! Order {order.order_number} was automatically delivered!")
        print(f"✅ Status changed from 'pending' to 'delivered'")
        print(f"✅ Delivery time set: {order.actual_delivery}")
        print(f"✅ Review eligible: {order.review_eligible}")
    else:
        print(f"\n❌ FAILED! Order {order.order_number} was not delivered")
        print(f"❌ Status is still: {order.status}")
    
    # Clean up test order
    try:
        order.delete()
        print(f"\n🧹 Cleaned up test order")
    except Exception as e:
        print(f"⚠️ Warning: Could not clean up test order: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🧪 Test completed!")

if __name__ == '__main__':
    test_5min_auto_delivery()
