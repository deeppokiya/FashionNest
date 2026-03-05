from celery import shared_task
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from .models import Order
from payments.models import Payment

@shared_task
def send_order_confirmation_email(order_id):
    """Send order confirmation email to customer"""
    try:
        print(f"📧 Starting order confirmation email for order {order_id}")
        order = Order.objects.get(id=order_id)
        print(f"📧 Found order: {order.order_number} for user {order.user.email}")
        
        # Email context
        context = {
            'order': order,
            'items': order.items.all(),
            'user': order.user
        }
        print(f"📧 Email context prepared with {len(context['items'])} items")
        
        # Render email templates
        subject = f'Order Confirmation - {order.order_number}'
        print(f"📧 Email subject: {subject}")
        
        try:
            html_message = render_to_string('emails/order_confirmation.html', context)
            plain_message = render_to_string('emails/order_confirmation.txt', context)
            print(f"📧 Email templates rendered successfully")
        except Exception as template_error:
            print(f"❌ Template rendering error: {str(template_error)}")
            raise template_error
        
        # Send email with FashionNest as sender name
        print(f"📧 Attempting to send email to {order.user.email}")
        
        # For console backend, use a fixed from email
        from_email = 'FashionNest <noreply@fashionnest.com>'
        print(f"📧 From email: {from_email}")
        
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                html_message=html_message,
                from_email=from_email,
                recipient_list=[order.user.email],
                fail_silently=False,
            )
            print(f"✅ Email sent successfully via console backend")
        except Exception as send_error:
            print(f"❌ Send mail error: {str(send_error)}")
            print(f"🔍 Send error type: {type(send_error).__name__}")
            raise send_error
        
        print(f"✅ Order confirmation email sent to {order.user.email}")
        return f"Order confirmation email sent to {order.user.email}"
        
    except Order.DoesNotExist:
        print(f"❌ Order {order_id} not found")
        return f"Order {order_id} not found"
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        print(f"🔍 Error type: {type(e).__name__}")
        print(f"🔍 Error details: {str(e)}")
        return f"Failed to send email: {str(e)}"

@shared_task
def send_payment_confirmation_email(order_id):
    """Send payment confirmation email to customer"""
    try:
        order = Order.objects.get(id=order_id)
        
        # Only send payment confirmation if payment is completed
        if order.payment_status != 'completed':
            print(f"⚠️ Payment not completed for order {order_id}, skipping payment confirmation email")
            return f"Payment not completed for order {order_id}"
        
        # Email context
        context = {
            'order': order,
            'items': order.items.all(),
            'user': order.user
        }
        
        # Render email templates
        subject = f'Payment Confirmation - {order.order_number}'
        html_message = render_to_string('emails/payment_confirmation.html', context)
        plain_message = render_to_string('emails/payment_confirmation.txt', context)
        
        # Send email with FashionNest as sender name
        from_email = 'FashionNest <noreply@fashionnest.com>'
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                html_message=html_message,
                from_email=from_email,
                recipient_list=[order.user.email],
                fail_silently=False,
            )
            print(f"✅ Payment confirmation email sent successfully via console backend")
        except Exception as send_error:
            print(f"❌ Payment confirmation send mail error: {str(send_error)}")
            print(f"🔍 Send error type: {type(send_error).__name__}")
            raise send_error
        
        print(f"✅ Payment confirmation email sent to {order.user.email}")
        return f"Payment confirmation email sent to {order.user.email}"
        
    except Order.DoesNotExist:
        print(f"❌ Order {order_id} not found")
        return f"Order {order_id} not found"
    except Exception as e:
        print(f"❌ Failed to send payment confirmation email: {str(e)}")
        return f"Failed to send payment confirmation email: {str(e)}"

@shared_task
def send_order_status_update_email(order_id, status):
    """Send order status update email"""
    try:
        order = Order.objects.get(id=order_id)
        
        context = {
            'order': order,
            'status': status,
            'user': order.user
        }
        
        subject = f'Order Status Update - {order.order_number}'
        html_message = render_to_string('emails/order_status_update.html', context)
        plain_message = render_to_string('emails/order_status_update.txt', context)
        
        from_email = 'FashionNest <noreply@fashionnest.com>'
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                html_message=html_message,
                from_email=from_email,
                recipient_list=[order.user.email],
                fail_silently=False,
            )
            print(f"✅ Order status update email sent successfully via console backend")
        except Exception as send_error:
            print(f"❌ Order status update send mail error: {str(send_error)}")
            print(f"🔍 Send error type: {type(send_error).__name__}")
            raise send_error
        
        print(f"✅ Order status update email sent to {order.user.email}")
        return f"Order status update email sent to {order.user.email}"
        
    except Order.DoesNotExist:
        print(f"❌ Order {order_id} not found")
        return f"Order {order_id} not found"
    except Exception as e:
        print(f"❌ Failed to send email: {str(e)}")
        return f"Failed to send email: {str(e)}"

@shared_task
def send_admin_order_notification(order_id):
    """Send notification to admin about new order"""
    try:
        order = Order.objects.get(id=order_id)
        
        context = {
            'order': order,
            'items': order.items.all(),
            'user': order.user
        }
        
        subject = f'New Order Received - {order.order_number}'
        html_message = render_to_string('emails/admin_order_notification.html', context)
        plain_message = render_to_string('emails/admin_order_notification.txt', context)
        
        # Send to admin email (you can configure this in settings)
        admin_email = getattr(settings, 'ADMIN_EMAIL', 'admin@fashionnest.com')
        
        from_email = 'FashionNest <noreply@fashionnest.com>'
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                html_message=html_message,
                from_email=from_email,
                recipient_list=[admin_email],
                fail_silently=False,
            )
            print(f"✅ Admin notification sent successfully via console backend")
        except Exception as send_error:
            print(f"❌ Admin notification send mail error: {str(send_error)}")
            print(f"🔍 Send error type: {type(send_error).__name__}")
            raise send_error
        
        print(f"✅ Admin notification sent for order {order.order_number}")
        return f"Admin notification sent for order {order.order_number}"
        
    except Order.DoesNotExist:
        print(f"❌ Order {order_id} not found")
        return f"Order {order_id} not found"
    except Exception as e:
        print(f"❌ Failed to send admin notification: {str(e)}")
        return f"Failed to send admin notification: {str(e)}"

@shared_task
def auto_update_order_status():
    """Automatically update order status from pending to delivered after 5 minutes"""
    five_minutes_ago = timezone.now() - timedelta(minutes=5)
    pending_orders = Order.objects.filter(
        status='pending', 
        created_at__lte=five_minutes_ago,
        payment_status='completed'  # Only auto-deliver paid orders
    )
    
    updated_count = 0
    for order in pending_orders:
        order.status = 'delivered'
        order.actual_delivery = timezone.now()
        order.review_eligible = True
        order.save()
        
        # Send status update email
        try:
            send_order_status_update_email(order.id, 'delivered')
            print(f"✅ Order {order.order_number} automatically marked as delivered")
        except Exception as e:
            print(f"⚠️ Failed to send status update email for order {order.order_number}: {str(e)}")
        
        updated_count += 1
    
    if updated_count > 0:
        print(f"🎉 Auto-delivered {updated_count} orders")
    return f"Auto-delivered {updated_count} orders"

@shared_task
def send_review_reminder_email(order_id):
    """Send review reminder email for delivered orders"""
    try:
        order = Order.objects.get(id=order_id)
        
        # Only send reminder if order is delivered and review eligible
        if not order.is_delivered or not order.review_eligible:
            return f"Order {order_id} not eligible for review reminder"
        
        # Check if user has already reviewed all products in the order
        from products.models import Review
        order_products = [item.product for item in order.items.all()]
        reviewed_products = Review.objects.filter(
            user=order.user,
            product__in=order_products
        ).values_list('product_id', flat=True)
        
        unreviewed_products = [p for p in order_products if p.id not in reviewed_products]
        
        if not unreviewed_products:
            return f"All products in order {order_id} already reviewed"
        
        context = {
            'order': order,
            'unreviewed_products': unreviewed_products,
            'user': order.user
        }
        
        subject = f'Review Your Recent Purchase - {order.order_number}'
        html_message = render_to_string('emails/review_reminder.html', context)
        plain_message = render_to_string('emails/review_reminder.txt', context)
        
        from_email = 'FashionNest <noreply@fashionnest.com>'
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                html_message=html_message,
                from_email=from_email,
                recipient_list=[order.user.email],
                fail_silently=False,
            )
            print(f"✅ Review reminder email sent successfully via console backend")
        except Exception as send_error:
            print(f"❌ Review reminder send mail error: {str(send_error)}")
            print(f"🔍 Send error type: {type(send_error).__name__}")
            raise send_error
        
        # Mark reminder as sent
        order.review_reminder_sent = True
        order.save()
        
        print(f"✅ Review reminder sent for order {order.order_number}")
        return f"Review reminder sent for order {order.order_number}"
        
    except Order.DoesNotExist:
        print(f"❌ Order {order_id} not found")
        return f"Order {order_id} not found"
    except Exception as e:
        print(f"❌ Failed to send review reminder: {str(e)}")
        return f"Failed to send review reminder: {str(e)}"

@shared_task
def send_review_reminders_batch():
    """Send review reminders for all eligible delivered orders"""
    from datetime import timedelta
    
    # Find orders delivered 2-7 days ago that haven't received a reminder
    two_days_ago = timezone.now() - timedelta(days=2)
    seven_days_ago = timezone.now() - timedelta(days=7)
    
    eligible_orders = Order.objects.filter(
        status='delivered',
        review_eligible=True,
        review_reminder_sent=False,
        actual_delivery__gte=seven_days_ago,
        actual_delivery__lte=two_days_ago
    )
    
    sent_count = 0
    for order in eligible_orders:
        try:
            result = send_review_reminder_email(order.id)
            if "sent" in result.lower():
                sent_count += 1
        except Exception as e:
            print(f"⚠️ Failed to send review reminder for order {order.id}: {str(e)}")
    
    print(f"📧 Sent {sent_count} review reminders")
    return f"Sent {sent_count} review reminders"

@shared_task
def process_payment_details(payment_id):
    """Process and store detailed payment information"""
    try:
        payment = Payment.objects.get(id=payment_id)
        
        # Update payment with additional details if available
        if payment.payment_method == 'stripe' and payment.payment_intent_id:
            import stripe
            stripe.api_key = settings.STRIPE_SECRET_KEY
            
            try:
                payment_intent = stripe.PaymentIntent.retrieve(payment.payment_intent_id)
                
                # Extract card details if available
                if payment_intent.payment_method:
                    pm = stripe.PaymentMethod.retrieve(payment_intent.payment_method)
                    if pm.card:
                        payment.card_last4 = pm.card.last4
                        payment.card_brand = pm.card.brand
                        payment.card_exp_month = pm.card.exp_month
                        payment.card_exp_year = pm.card.exp_year
                
                # Extract billing details if available
                if payment_intent.charges.data:
                    charge = payment_intent.charges.data[0]
                    if charge.billing_details:
                        payment.billing_name = charge.billing_details.name or ''
                        payment.billing_email = charge.billing_details.email or ''
                        payment.billing_phone = charge.billing_details.phone or ''
                        
                        if charge.billing_details.address:
                            addr = charge.billing_details.address
                            payment.billing_address = f"{addr.line1 or ''} {addr.line2 or ''}".strip()
                            payment.billing_city = addr.city or ''
                            payment.billing_state = addr.state or ''
                            payment.billing_zip_code = addr.postal_code or ''
                            payment.billing_country = addr.country or ''
                
                payment.processed_at = timezone.now()
                payment.save()
                
                print(f"✅ Payment details processed for payment {payment.id}")
                return f"Payment details processed for payment {payment.id}"
                
            except stripe.error.StripeError as e:
                payment.error_message = str(e)
                payment.error_code = e.code if hasattr(e, 'code') else 'stripe_error'
                payment.save()
                print(f"⚠️ Stripe error processing payment {payment.id}: {str(e)}")
                return f"Stripe error: {str(e)}"
        
        return f"Payment {payment.id} processed (no additional details available)"
        
    except Payment.DoesNotExist:
        print(f"❌ Payment {payment_id} not found")
        return f"Payment {payment_id} not found"
    except Exception as e:
        print(f"❌ Failed to process payment details: {str(e)}")
        return f"Failed to process payment details: {str(e)}"

@shared_task
def auto_deliver_orders():
    """Legacy function - keeping for backward compatibility"""
    return auto_update_order_status() 