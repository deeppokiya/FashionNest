#!/usr/bin/env python
"""
Test script for simple payment confirmation flow
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
from payments.models import Payment
from users.models import User
from products.models import Product

def test_simple_payment_flow():
    """Test the simple payment confirmation flow"""
    print("🧪 Testing Simple Payment Flow")
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
        'payment_method': 'paypal',
        'payment_status': 'pending',  # Start as pending
        'shipping_address': '123 Test St',
        'shipping_city': 'Test City',
        'shipping_state': 'Test State',
        'shipping_zip_code': '12345',
        'shipping_country': 'Test Country',
        'shipping_phone': '123-456-7890',
    }
    
    order = Order.objects.create(**order_data)
    
    print(f"📦 Created test order: {order.order_number}")
    print(f"📊 Order status: {order.status}")
    print(f"💳 Payment status: {order.payment_status}")
    
    # Simulate PayPal payment confirmation
    print("\n🔄 Simulating PayPal payment confirmation...")
    
    # Create payment record
    payment_data = {
        'order': order,
        'amount': order.total_amount,
        'payment_method': 'paypal',
        'status': 'completed',
        'transaction_id': f"paypal_{order.order_number}_{int(timezone.now().timestamp())}",
        'currency': 'USD',
        'billing_name': f"{user.first_name} {user.last_name}".strip(),
        'billing_email': user.email,
        'billing_phone': order.shipping_phone,
        'billing_address': order.shipping_address,
        'billing_city': order.shipping_city,
        'billing_state': order.shipping_state,
        'billing_zip_code': order.shipping_zip_code,
        'billing_country': order.shipping_country,
        'processed_at': timezone.now(),
    }
    
    payment = Payment.objects.create(**payment_data)
    
    # Update order payment status
    order.payment_status = 'completed'
    order.transaction_id = payment.transaction_id
    order.save()
    
    print(f"✅ Payment confirmed!")
    print(f"📊 Updated order payment status: {order.payment_status}")
    print(f"📊 Payment record created: {payment.id}")
    print(f"💳 Transaction ID: {payment.transaction_id}")
    
    # Test payment status check
    print("\n🔍 Testing payment status check...")
    try:
        # Simulate the payment status check
        payment_status_data = {
            'order_id': order.id,
            'order_number': order.order_number,
            'payment_status': order.payment_status,
            'order_status': order.status,
            'payment_details': {
                'id': payment.id,
                'status': payment.status,
                'amount': str(payment.amount),
                'payment_method': payment.payment_method,
                'transaction_id': payment.transaction_id
            },
            'total_amount': str(order.total_amount)
        }
        
        print(f"✅ Payment status check successful:")
        print(f"   Order ID: {payment_status_data['order_id']}")
        print(f"   Payment Status: {payment_status_data['payment_status']}")
        print(f"   Order Status: {payment_status_data['order_status']}")
        print(f"   Transaction ID: {payment_status_data['payment_details']['transaction_id']}")
        
    except Exception as e:
        print(f"❌ Payment status check failed: {str(e)}")
    
    # Test auto-delivery
    print("\n🔄 Testing auto-delivery...")
    try:
        from orders.tasks import auto_update_order_status
        result = auto_update_order_status()
        print(f"✅ Auto-delivery result: {result}")
        
        # Refresh order
        order.refresh_from_db()
        print(f"📊 Order status after auto-delivery: {order.status}")
        print(f"✍️ Review eligible: {order.review_eligible}")
        
    except Exception as e:
        print(f"❌ Auto-delivery failed: {str(e)}")
    
    print("\n" + "=" * 50)
    print("✅ Simple payment flow test completed!")
    print("\n📋 Summary:")
    print(f"   - Order created: {order.order_number}")
    print(f"   - Payment status: {order.payment_status}")
    print(f"   - Payment record: {payment.id}")
    print(f"   - Transaction ID: {payment.transaction_id}")
    print(f"   - Order status: {order.status}")
    print(f"   - Review eligible: {order.review_eligible}")

if __name__ == "__main__":
    test_simple_payment_flow()














