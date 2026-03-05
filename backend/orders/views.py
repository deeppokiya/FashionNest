from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Order, OrderItem, Cart, CartItem
from .serializers import (
    OrderSerializer, OrderCreateSerializer, CartSerializer,
    CartItemSerializer, CartItemCreateSerializer, CartItemUpdateSerializer
)
from products.models import Product
from decimal import Decimal
from django.conf import settings
from .tasks import send_order_confirmation_email, send_admin_order_notification, send_payment_confirmation_email

class CartView(generics.RetrieveAPIView):
    """Get user's cart"""
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

class CartItemCreateView(generics.CreateAPIView):
    """Add item to cart"""
    serializer_class = CartItemCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart_item = serializer.save()
        
        # Return the updated cart
        cart = cart_item.cart
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data, status=status.HTTP_201_CREATED)

class CartItemUpdateView(generics.UpdateAPIView):
    """Update cart item quantity"""
    serializer_class = CartItemUpdateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return get_object_or_404(CartItem, id=self.kwargs['item_id'], cart__user=self.request.user)
    
    def update(self, request, *args, **kwargs):
        cart_item = self.get_object()
        serializer = self.get_serializer(cart_item, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        # Return the updated cart
        cart = cart_item.cart
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data, status=status.HTTP_200_OK)

class CartItemDeleteView(generics.DestroyAPIView):
    """Remove item from cart"""
    permission_classes = [IsAuthenticated]
    serializer_class = CartSerializer
    
    def get_object(self):
        return get_object_or_404(CartItem, id=self.kwargs['item_id'], cart__user=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        cart_item = self.get_object()
        cart = cart_item.cart
        cart_item.delete()
        
        # Return the updated cart
        serializer = self.get_serializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)

class OrderListView(generics.ListAPIView):
    """Get user's orders"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class OrderDetailView(generics.RetrieveAPIView):
    """Get order details"""
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

class OrderCreateView(generics.CreateAPIView):
    """Create new order from cart"""
    serializer_class = OrderCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        # Get user's cart
        try:
            cart = Cart.objects.get(user=request.user)
        except Cart.DoesNotExist:
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not cart.items.exists():
            return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create order
        order_data = request.data.copy()
        order_data['user'] = request.user.id
        order_data['subtotal'] = cart.total_amount
        # Use Decimal for all calculations
        tax = Decimal(str(order_data.get('tax', 0)))
        shipping_cost = Decimal(str(order_data.get('shipping_cost', 0)))
        order_data['total_amount'] = cart.total_amount + tax + shipping_cost
        
        # Always set payment status as pending initially
        # Payment status will be updated after actual payment confirmation
        order_data['payment_status'] = 'pending'
        
        serializer = self.get_serializer(data=order_data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
        # Create order items from cart items
        for cart_item in cart.items.all():
            # Update product stock
            product = cart_item.product
            if product.stock_quantity >= cart_item.quantity:
                product.stock_quantity -= cart_item.quantity
                product.save()
                print(f"✅ Stock updated for {product.name}: {cart_item.quantity} units deducted")
            else:
                # This shouldn't happen due to validation, but handle it gracefully
                print(f"⚠️ Insufficient stock for {product.name}")
            
            OrderItem.objects.create(
                order=order,
                product=cart_item.product,
                quantity=cart_item.quantity,
                price=cart_item.product.current_price,
                size=cart_item.size,
                color=cart_item.color
            )
        
        # Clear cart
        cart.items.all().delete()
        
        # Send order confirmation email immediately (call function directly)
        try:
            from .tasks import send_order_confirmation_email, send_admin_order_notification
            
            # Send confirmation email to customer (order received, not payment confirmed)
            # Call the function directly instead of using Celery to avoid any issues
            result = send_order_confirmation_email(order.id)
            print(f"✅ Order confirmation email sent to {order.user.email}")
            print(f"📧 Email result: {result}")
            
            # Send notification to admin
            admin_result = send_admin_order_notification(order.id)
            print(f"✅ Admin notification sent for order {order.order_number}")
            print(f"📧 Admin email result: {admin_result}")
            
        except Exception as e:
            # Log the error but don't fail the order creation
            print(f"⚠️ Failed to send order confirmation emails: {str(e)}")
            print(f"🔍 Error details: {type(e).__name__}: {str(e)}")
            # Continue with order creation even if email fails
        
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    """Clear user's cart"""
    try:
        cart = Cart.objects.get(user=request.user)
        cart.items.all().delete()
        
        # Return the updated cart
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Cart.DoesNotExist:
        return Response({'error': 'Cart not found'}, status=status.HTTP_404_NOT_FOUND) 