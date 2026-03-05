#!/usr/bin/env python3
"""
Test script to verify SMTP email functionality
"""

import os
import sys
import django
from django.core.mail import send_mail
from django.template.loader import render_to_string

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fashionnest.settings')
django.setup()

from django.conf import settings

def test_smtp_email():
    """Test SMTP email sending"""
    print("🧪 Testing SMTP Email System")
    print("=" * 50)
    
    # Test email data
    subject = 'Test Email from FashionNest'
    message = 'This is a test email to verify SMTP configuration.'
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = ['deep.pokiya1312@gmail.com']
    
    print(f"📧 Email Configuration:")
    print(f"   Backend: {settings.EMAIL_BACKEND}")
    print(f"   Host: {settings.EMAIL_HOST}")
    print(f"   Port: {settings.EMAIL_PORT}")
    print(f"   TLS: {settings.EMAIL_USE_TLS}")
    print(f"   SSL: {settings.EMAIL_USE_SSL}")
    print(f"   User: {settings.EMAIL_HOST_USER}")
    print(f"   From: {from_email}")
    print(f"   To: {recipient_list}")
    
    try:
        # Send test email
        print("\n📤 Sending test email...")
        result = send_mail(
            subject=subject,
            message=message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        
        print(f"✅ Email sent successfully!")
        print(f"📊 Result: {result}")
        print(f"📧 Email should be delivered to {recipient_list[0]}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        print(f"🔍 Error type: {type(e).__name__}")
        
        # Provide helpful error messages
        if "authentication" in str(e).lower():
            print("\n💡 Authentication Error - Check your email credentials:")
            print("   1. Make sure EMAIL_HOST_USER is correct")
            print("   2. Make sure EMAIL_HOST_PASSWORD is your app password (not regular password)")
            print("   3. Enable 2-factor authentication on your Gmail account")
            print("   4. Generate an app password in Gmail settings")
        elif "connection" in str(e).lower():
            print("\n💡 Connection Error - Check your network and email settings:")
            print("   1. Make sure EMAIL_HOST is correct (smtp.gmail.com)")
            print("   2. Make sure EMAIL_PORT is correct (587 for TLS)")
            print("   3. Check your internet connection")
        elif "ssl" in str(e).lower() or "tls" in str(e).lower():
            print("\n💡 SSL/TLS Error - Check your email security settings:")
            print("   1. Make sure EMAIL_USE_TLS=True")
            print("   2. Make sure EMAIL_USE_SSL=False")
            print("   3. Try port 587 for TLS or 465 for SSL")
        
        return False

def test_order_confirmation_email():
    """Test order confirmation email template"""
    print("\n🧪 Testing Order Confirmation Email Template")
    print("=" * 50)
    
    # Mock order data
    order_data = {
        'order_number': 'TEST123456',
        'created_at': '2025-08-17',
        'status': 'Pending',
        'payment_status': 'Pending',
        'subtotal': '₹4999.00',
        'tax': '₹5.00',
        'shipping_cost': '₹10.00',
        'total_amount': '₹5014.00',
        'shipping_address': '123 Test Street',
        'shipping_city': 'Test City',
        'shipping_state': 'Test State',
        'shipping_zip_code': '12345',
        'shipping_country': 'Test Country',
        'shipping_phone': '+1234567890',
    }
    
    user_data = {
        'first_name': 'Deep',
        'email': 'deep.pokiya1312@gmail.com'
    }
    
    items_data = [
        {
            'product': {'name': 'Running Shoes'},
            'quantity': 1,
            'price': '₹4999.00',
            'size': 'M',
            'color': 'Black'
        }
    ]
    
    context = {
        'order': order_data,
        'user': user_data,
        'items': items_data
    }
    
    try:
        # Render email template
        html_message = render_to_string('emails/order_confirmation.html', context)
        plain_message = render_to_string('emails/order_confirmation.txt', context)
        
        print("✅ Email templates rendered successfully")
        print(f"📧 HTML length: {len(html_message)} characters")
        print(f"📧 Text length: {len(plain_message)} characters")
        
        # Send order confirmation email
        subject = f'Order Confirmation - {order_data["order_number"]}'
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [user_data['email']]
        
        print(f"\n📤 Sending order confirmation email...")
        result = send_mail(
            subject=subject,
            message=plain_message,
            html_message=html_message,
            from_email=from_email,
            recipient_list=recipient_list,
            fail_silently=False,
        )
        
        print(f"✅ Order confirmation email sent successfully!")
        print(f"📊 Result: {result}")
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to send order confirmation email: {str(e)}")
        print(f"🔍 Error type: {type(e).__name__}")
        return False

def main():
    """Main test function"""
    print("🚀 Starting SMTP Email Tests")
    print("=" * 60)
    
    # Test 1: Basic SMTP email
    test1_success = test_smtp_email()
    
    # Test 2: Order confirmation email
    test2_success = test_order_confirmation_email()
    
    print("\n" + "=" * 60)
    print("📊 Test Results Summary:")
    print(f"   Basic SMTP Test: {'✅ PASSED' if test1_success else '❌ FAILED'}")
    print(f"   Order Confirmation Test: {'✅ PASSED' if test2_success else '❌ FAILED'}")
    
    if test1_success and test2_success:
        print("\n🎉 ALL EMAIL TESTS PASSED!")
        print("✅ SMTP configuration is working correctly")
        print("✅ Order confirmation emails are being sent")
        print("✅ Email templates are rendering properly")
    else:
        print("\n❌ SOME EMAIL TESTS FAILED")
        print("Please check your email configuration in .env file")
        print("Make sure to set up proper Gmail app password")
    
    print("=" * 60)

if __name__ == "__main__":
    main()




