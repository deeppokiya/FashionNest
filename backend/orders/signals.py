from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Order, OrderItem
from .tasks import auto_update_order_status
import threading
import time

@receiver(post_save, sender=Order)
def handle_order_creation(sender, instance, created, **kwargs):
    """Handle order creation and schedule automatic status update"""
    if created:
        print(f"🎉 New order created: {instance.order_number}")
        
        # Schedule automatic status update after 5 minutes
        def schedule_status_update():
            time.sleep(300)  # Wait 5 minutes
            auto_update_order_status()
        
        # Run in background thread
        thread = threading.Thread(target=schedule_status_update)
        thread.daemon = True
        thread.start()
        
        print(f"⏰ Scheduled automatic status update for order {instance.order_number} in 5 minutes")

@receiver(post_save, sender=OrderItem)
def handle_order_item_creation(sender, instance, created, **kwargs):
    """Handle order item creation and update stock"""
    if created:
        product = instance.product
        print(f"📦 Order item created: {instance.quantity}x {product.name}")
        
        # Stock is already updated in the view, but we can add additional logging here
        print(f"📊 Current stock for {product.name}: {product.stock_quantity}")

@receiver(post_delete, sender=OrderItem)
def handle_order_item_deletion(sender, instance, **kwargs):
    """Handle order item deletion and restore stock"""
    product = instance.product
    product.stock_quantity += instance.quantity
    product.save()
    print(f"🔄 Stock restored for {product.name}: +{instance.quantity} units")


