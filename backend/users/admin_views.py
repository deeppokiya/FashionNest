from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django_filters import rest_framework as django_filters

from products.models import Category, Product, ProductImage, Review
from products.serializers import (
    CategorySerializer, ProductSerializer, ProductCreateSerializer,
    ReviewSerializer
)
from orders.models import Order
from payments.models import Payment
from users.models import Admin

# Admin Product Management
class AdminProductListView(generics.ListCreateAPIView):
    """Admin: List and create products"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'brand']
    ordering_fields = ['price', 'rating', 'created_at']
    ordering = ['-created_at']

class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, and delete product"""
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

class AdminProductCreateView(generics.CreateAPIView):
    """Admin: Create new product with images"""
    serializer_class = ProductCreateSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        
        # Handle product images
        images_data = request.FILES.getlist('images')
        for i, image_file in enumerate(images_data):
            ProductImage.objects.create(
                product=product,
                image=image_file,
                alt_text=request.data.get(f'image_alt_{i}', ''),
                is_primary=(i == 0)  # First image is primary
            )
        
        return Response(ProductSerializer(product).data, status=status.HTTP_201_CREATED)

# Admin Category Management
class AdminCategoryListView(generics.ListCreateAPIView):
    """Admin: List and create categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, and delete category"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

# Admin Payment Management
@api_view(['GET'])
@permission_classes([AllowAny])
def admin_payment_list(request):
    """Admin: Get all payment details"""
    payments = Payment.objects.all().order_by('-created_at')
    
    payment_data = []
    for payment in payments:
        payment_data.append({
            'id': payment.id,
            'order_number': payment.order.order_number if payment.order else None,
            'user_email': payment.order.user.email if payment.order else None,
            'amount': float(payment.amount),
            'currency': payment.currency,
            'payment_method': payment.payment_method,
            'status': payment.status,
            'transaction_id': payment.transaction_id,
            'created_at': payment.created_at,
            'updated_at': payment.updated_at
        })
    
    return Response({
        'count': len(payment_data),
        'payments': payment_data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def admin_payment_detail(request, payment_id):
    """Admin: Get specific payment details"""
    payment = get_object_or_404(Payment, id=payment_id)
    
    payment_data = {
        'id': payment.id,
        'order': {
            'id': payment.order.id,
            'order_number': payment.order.order_number,
            'user': {
                'id': payment.order.user.id,
                'email': payment.order.user.email,
                'name': f"{payment.order.user.first_name} {payment.order.user.last_name}"
            },
            'total_amount': float(payment.order.total_amount),
            'status': payment.order.status,
            'created_at': payment.order.created_at
        },
        'amount': float(payment.amount),
        'currency': payment.currency,
        'payment_method': payment.payment_method,
        'status': payment.status,
        'transaction_id': payment.transaction_id,
        'stripe_payment_intent_id': payment.stripe_payment_intent_id,
        'created_at': payment.created_at,
        'updated_at': payment.updated_at
    }
    
    return Response(payment_data)

# Admin Review Management
class AdminReviewListView(generics.ListAPIView):
    """Admin: List all reviews"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'comment', 'user__username', 'product__name']
    ordering_fields = ['rating', 'created_at']
    ordering = ['-created_at']

class AdminReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, and delete review"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

# Admin Dashboard
@api_view(['GET'])
@permission_classes([AllowAny])
def admin_dashboard(request):
    """Admin: Dashboard with summary statistics"""
    from django.db.models import Count, Sum, Avg
    from django.utils import timezone
    from datetime import timedelta
    
    # Get date range (last 30 days)
    end_date = timezone.now()
    start_date = end_date - timedelta(days=30)
    
    # Product statistics
    total_products = Product.objects.count()
    active_products = Product.objects.filter(is_active=True).count()
    featured_products = Product.objects.filter(is_featured=True).count()
    
    # Order statistics
    total_orders = Order.objects.count()
    recent_orders = Order.objects.filter(created_at__gte=start_date).count()
    delivered_orders = Order.objects.filter(status='delivered').count()
    
    # Payment statistics
    total_payments = Payment.objects.count()
    successful_payments = Payment.objects.filter(status='completed').count()
    total_revenue = Payment.objects.filter(status='completed').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    # Review statistics
    total_reviews = Review.objects.count()
    recent_reviews = Review.objects.filter(created_at__gte=start_date).count()
    avg_rating = Review.objects.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
    
    # User statistics
    total_users = User.objects.count()
    recent_users = User.objects.filter(date_joined__gte=start_date).count()
    
    return Response({
        'summary': {
            'products': {
                'total': total_products,
                'active': active_products,
                'featured': featured_products
            },
            'orders': {
                'total': total_orders,
                'recent': recent_orders,
                'delivered': delivered_orders
            },
            'payments': {
                'total': total_payments,
                'successful': successful_payments,
                'revenue': float(total_revenue)
            },
            'reviews': {
                'total': total_reviews,
                'recent': recent_reviews,
                'avg_rating': round(float(avg_rating), 2)
            },
            'users': {
                'total': total_users,
                'recent': recent_users
            }
        },
        'date_range': {
            'start': start_date,
            'end': end_date
        }
    })

# Admin Order Management
@api_view(['GET'])
@permission_classes([AllowAny])
def admin_order_list(request):
    """Admin: Get all orders"""
    orders = Order.objects.all().order_by('-created_at')
    
    order_data = []
    for order in orders:
        order_data.append({
            'id': order.id,
            'order_number': order.order_number,
            'user': {
                'id': order.user.id,
                'email': order.user.email,
                'name': f"{order.user.first_name} {order.user.last_name}"
            },
            'total_amount': float(order.total_amount),
            'status': order.status,
            'payment_status': order.payment_status,
            'created_at': order.created_at,
            'delivered_at': order.actual_delivery
        })
    
    return Response({
        'count': len(order_data),
        'orders': order_data
    })

@api_view(['GET'])
@permission_classes([AllowAny])
def admin_order_detail(request, order_id):
    """Admin: Get specific order details"""
    order = get_object_or_404(Order, id=order_id)
    
    order_data = {
        'id': order.id,
        'order_number': order.order_number,
        'user': {
            'id': order.user.id,
            'email': order.user.email,
            'name': f"{order.user.first_name} {order.user.last_name}",
            'phone': order.user.phone,
            'address': order.user.address
        },
        'items': [
            {
                'id': item.id,
                'product': {
                    'id': item.product.id,
                    'name': item.product.name,
                    'slug': item.product.slug
                },
                'quantity': item.quantity,
                'price': float(item.price),
                'size': item.size,
                'color': item.color
            }
            for item in order.items.all()
        ],
        'subtotal': float(order.subtotal),
        'tax': float(order.tax),
        'shipping_cost': float(order.shipping_cost),
        'total_amount': float(order.total_amount),
        'status': order.status,
        'payment_status': order.payment_status,
        'shipping_address': order.shipping_address,
        'created_at': order.created_at,
        'delivered_at': order.actual_delivery,
        'review_eligible': order.review_eligible
    }
    
    return Response(order_data)
