from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django_filters import rest_framework as django_filters
from .models import Category, Product, Review
from .serializers import (
    CategorySerializer, ProductSerializer, ProductListSerializer,
    ProductCreateSerializer, ReviewSerializer, ReviewCreateSerializer
)

class ProductFilter(django_filters.FilterSet):
    """Custom filter for products"""
    sale = django_filters.BooleanFilter(method='filter_sale_products')
    
    class Meta:
        model = Product
        fields = ['category', 'brand', 'gender', 'is_featured']
    
    def filter_sale_products(self, queryset, name, value):
        """Filter products that are on sale"""
        if value:
            return queryset.filter(sale_price__isnull=False)
        return queryset

class CategoryListView(generics.ListAPIView):
    """List all categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class ProductListView(generics.ListAPIView):
    """List all products with filtering and search"""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'brand']
    ordering_fields = ['price', 'rating', 'created_at']
    ordering = ['-created_at']

class ProductDetailView(generics.RetrieveAPIView):
    """Get product details"""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

class ProductCreateView(generics.CreateAPIView):
    """Create new product (admin only)"""
    serializer_class = ProductCreateSerializer
    permission_classes = [IsAuthenticated]

class ProductUpdateView(generics.UpdateAPIView):
    """Update product (admin only)"""
    queryset = Product.objects.all()
    serializer_class = ProductCreateSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'

class ReviewListView(generics.ListCreateAPIView):
    """List and create reviews for a product (one-time only)"""
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        product_slug = self.kwargs.get('product_slug')
        product = get_object_or_404(Product, slug=product_slug)
        return Review.objects.filter(product=product)
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReviewCreateSerializer
        return ReviewSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        if self.request.method == 'POST':
            product_slug = self.kwargs.get('product_slug')
            product = get_object_or_404(Product, slug=product_slug)
            context['product_id'] = product.id
        return context
    
    def create(self, request, *args, **kwargs):
        """Create a review (one-time only) and return updated product data"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        
        # Get the updated product with new rating
        product = review.product
        product.refresh_from_db()  # Refresh to get updated rating
        
        # Return the updated product data
        product_serializer = ProductSerializer(product)
        return Response({
            'message': 'Review submitted successfully! Reviews cannot be edited once submitted.',
            'review': ReviewSerializer(review).data,
            'reviews': ReviewSerializer(product.reviews.all(), many=True).data,
            'rating': float(product.rating),
            'num_reviews': product.num_reviews
        }, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([AllowAny])
def featured_products(request):
    """Get featured products"""
    products = Product.objects.filter(is_active=True, is_featured=True)[:8]
    serializer = ProductListSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def sale_products(request):
    """Get products on sale"""
    products = Product.objects.filter(is_active=True, sale_price__isnull=False)[:8]
    serializer = ProductListSerializer(products, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_purchase_status(request, slug):
    """Check if the authenticated user has purchased this product"""
    try:
        product = get_object_or_404(Product, slug=slug)
        user = request.user
        
        # Check if user has any orders containing this product
        # You'll need to import the Order model and check order items
        from orders.models import Order, OrderItem
        
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            product=product,
            order__status='delivered'  # Only count delivered orders
        ).exists()
        
        return Response({
            'has_purchased': has_purchased,
            'product_id': product.id,
            'product_name': product.name
        })
    except Exception as e:
        return Response({
            'has_purchased': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST) 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_review_status(request, slug):
    """Check if the authenticated user can review this product"""
    try:
        product = get_object_or_404(Product, slug=slug)
        user = request.user
        
        # Check if user has already submitted a review
        has_reviewed = Review.objects.filter(user=user, product=product).exists()
        
        # Check if user has purchased and received this product
        from orders.models import OrderItem
        delivered_orders = OrderItem.objects.filter(
            order__user=user,
            product=product,
            order__status='delivered',
            order__payment_status='completed'
        ).select_related('order')
        
        has_purchased = delivered_orders.exists()
        
        # Get the most recent delivered order for this product
        latest_order = delivered_orders.order_by('-order__actual_delivery').first()
        
        can_review = has_purchased and not has_reviewed
        
        return Response({
            'can_review': can_review,
            'has_reviewed': has_reviewed,
            'has_purchased': has_purchased,
            'product_id': product.id,
            'product_name': product.name,
            'latest_order': {
                'order_number': latest_order.order.order_number,
                'delivered_at': latest_order.order.actual_delivery,
                'order_id': latest_order.order.id
            } if latest_order else None,
            'message': 'You can only review products you have purchased and received, and only once per product.'
        })
    except Exception as e:
        return Response({
            'can_review': False,
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review_with_order(request, slug):
    """Create a review with order verification"""
    try:
        product = get_object_or_404(Product, slug=slug)
        user = request.user
        order_id = request.data.get('order_id')
        
        # Verify the order belongs to the user and contains this product
        from orders.models import OrderItem
        try:
            order_item = OrderItem.objects.get(
                order_id=order_id,
                order__user=user,
                product=product,
                order__status='delivered',
                order__payment_status='completed'
            )
            order = order_item.order
        except OrderItem.DoesNotExist:
            return Response({
                'error': 'Invalid order or product not found in this order'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user has already reviewed this product
        if Review.objects.filter(user=user, product=product).exists():
            return Response({
                'error': 'You have already reviewed this product'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the review with order reference
        serializer = ReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        review = serializer.save(
            user=user,
            product=product,
            order=order,
            is_verified_purchase=True
        )
        
        # Update product rating
        product.refresh_from_db()
        
        return Response({
            'message': 'Review submitted successfully! Reviews cannot be edited once submitted.',
            'review': ReviewSerializer(review).data,
            'reviews': ReviewSerializer(product.reviews.all(), many=True).data,
            'rating': float(product.rating),
            'num_reviews': product.num_reviews,
            'order_verified': True
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'error': f'Failed to create review: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST) 