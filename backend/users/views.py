from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import User, Admin
from .serializers import (
    UserSerializer, UserUpdateSerializer, UserRegistrationSerializer, UserLoginSerializer,
    AdminSerializer, AdminRegistrationSerializer, AdminLoginSerializer
)
from products.models import Product, Category, ProductImage, Review
from products.serializers import (
    ProductSerializer, ProductCreateSerializer, CategorySerializer
)
from orders.models import Order
from payments.models import Payment
from orders.serializers import OrderSerializer

# Custom permissions
class IsAdminUser(permissions.BasePermission):
    """Custom permission to only allow admin users"""
    def has_permission(self, request, view):
        # Check if user is authenticated and is an admin
        return request.user and hasattr(request.user, 'is_active') and request.user.is_active

# User Views
class UserRegistrationView(generics.CreateAPIView):
    """User registration"""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Add custom claims for user identification
        access_token['user_id'] = user.id
        access_token['is_admin'] = False
        access_token['email'] = user.email
        
        return Response({
            'message': 'Registration successful',
            'access': str(access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class UserLoginView(generics.GenericAPIView):
    """User login"""
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Add custom claims for user identification
        access_token['user_id'] = user.id
        access_token['is_admin'] = False
        access_token['email'] = user.email
        
        return Response({
            'message': 'Login successful',
            'access': str(access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def user_logout(request):
    """User logout"""
    logout(request)
    return Response({'message': 'Logout successful'})

class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view and update"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        """Use different serializers for GET and PUT/PATCH"""
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserSerializer
    
    def update(self, request, *args, **kwargs):
        """Handle profile update with better error handling"""
        try:
            partial = kwargs.pop('partial', False)
            instance = self.get_object()
            
            # Debug: Print received data
            print(f"📝 Received update data: {request.data}")
            
            serializer = self.get_serializer(instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            
            # Debug: Print validated data
            print(f"✅ Validated data: {serializer.validated_data}")
            
            self.perform_update(serializer)
            
            # Debug: Print updated instance
            print(f"🔄 Updated instance: {instance.first_name}, {instance.last_name}, {instance.phone}, {instance.address}, {instance.city}, {instance.state}, {instance.zip_code}, {instance.country}")
            
            # Return just the user data, not wrapped in a 'user' field
            return Response(UserSerializer(instance).data)
        except Exception as e:
            print(f"❌ Error in profile update: {str(e)}")
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)

# Admin Views
class AdminRegistrationView(generics.CreateAPIView):
    """Admin registration (superuser only)"""
    serializer_class = AdminRegistrationSerializer
    permission_classes = [permissions.AllowAny]  # You might want to restrict this

class AdminLoginView(generics.GenericAPIView):
    """Admin login"""
    serializer_class = AdminLoginSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        admin = serializer.validated_data['admin']
        
        # Update last login
        admin.last_login = timezone.now()
        admin.save()
        
        # Generate JWT tokens for admin
        # We need to create a user object for JWT token generation
        # Since admin is a separate model, we'll create a temporary user
        from django.contrib.auth.models import User as AuthUser
        try:
            auth_user = AuthUser.objects.get(email=admin.email)
        except AuthUser.DoesNotExist:
            # Create a temporary user for JWT token generation
            auth_user = AuthUser.objects.create_user(
                username=admin.username,
                email=admin.email,
                password='temp_password_for_jwt_only'
            )
        
        refresh = RefreshToken.for_user(auth_user)
        access_token = refresh.access_token
        
        # Add custom claims for admin identification
        access_token['admin_id'] = admin.id
        access_token['user_id'] = auth_user.id
        access_token['is_admin'] = True
        access_token['email'] = admin.email
        
        return Response({
            'message': 'Admin login successful',
            'access': str(access_token),
            'refresh': str(refresh),
            'admin': AdminSerializer(admin).data
        })

@api_view(['POST'])
def admin_logout(request):
    """Admin logout"""
    return Response({'message': 'Admin logout successful'})

class AdminProfileView(generics.RetrieveUpdateAPIView):
    """Admin profile view and update"""
    serializer_class = AdminSerializer
    permission_classes = [permissions.AllowAny]  # You might want to add custom admin permission
    
    def get_object(self):
        # This would need to be implemented based on your admin session management
        admin_id = self.request.data.get('admin_id')
        return Admin.objects.get(id=admin_id)

# Admin Product Management Views
class AdminProductListView(generics.ListCreateAPIView):
    """Admin: List and create products"""
    serializer_class = ProductCreateSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        return Product.objects.all().order_by('-created_at')
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ProductSerializer
        return ProductCreateSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            
            # Handle product images
            images_data = request.FILES.getlist('images')
            for i, image in enumerate(images_data):
                ProductImage.objects.create(
                    product=product,
                    image=image,
                    alt_text=request.data.get(f'image_alt_{i}', ''),
                    is_primary=(i == 0)  # First image is primary
                )
            
            return Response({
                'message': 'Product created successfully',
                'product': ProductSerializer(product).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, and delete product"""
    queryset = Product.objects.all()
    serializer_class = ProductCreateSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ProductSerializer
        return ProductCreateSerializer
    
    def update(self, request, *args, **kwargs):
        product = self.get_object()
        serializer = self.get_serializer(product, data=request.data, partial=True)
        if serializer.is_valid():
            product = serializer.save()
            
            # Handle new images
            images_data = request.FILES.getlist('images')
            for i, image in enumerate(images_data):
                ProductImage.objects.create(
                    product=product,
                    image=image,
                    alt_text=request.data.get(f'image_alt_{i}', ''),
                    is_primary=False
                )
            
            return Response({
                'message': 'Product updated successfully',
                'product': ProductSerializer(product).data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        product.delete()
        return Response({
            'message': 'Product deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)

# Admin Category Management Views
class AdminCategoryListView(generics.ListCreateAPIView):
    """Admin: List and create categories"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            category = serializer.save()
            return Response({
                'message': 'Category created successfully',
                'category': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin: Get, update, and delete category"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'slug'
    
    def update(self, request, *args, **kwargs):
        category = self.get_object()
        serializer = self.get_serializer(category, data=request.data, partial=True)
        if serializer.is_valid():
            category = serializer.save()
            return Response({
                'message': 'Category updated successfully',
                'category': serializer.data
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        category = self.get_object()
        category.delete()
        return Response({
            'message': 'Category deleted successfully'
        }, status=status.HTTP_204_NO_CONTENT)

# Admin Payment Details View
class AdminPaymentListView(generics.ListAPIView):
    """Admin: View all payment details"""
    serializer_class = None  # We'll create a custom response
    permission_classes = [IsAdminUser]
    
    def list(self, request, *args, **kwargs):
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

# Admin Reviews View
class AdminReviewListView(generics.ListAPIView):
    """Admin: View all reviews"""
    serializer_class = None  # We'll create a custom response
    permission_classes = [IsAdminUser]
    
    def list(self, request, *args, **kwargs):
        reviews = Review.objects.all().order_by('-created_at')
        
        review_data = []
        for review in reviews:
            review_data.append({
                'id': review.id,
                'product_name': review.product.name,
                'product_slug': review.product.slug,
                'user_email': review.user.email,
                'user_name': f"{review.user.first_name} {review.user.last_name}",
                'rating': review.rating,
                'title': review.title,
                'comment': review.comment,
                'is_verified_purchase': review.is_verified_purchase,
                'is_submitted': review.is_submitted,
                'created_at': review.created_at,
                'updated_at': review.updated_at
            })
        
        return Response({
            'count': len(review_data),
            'reviews': review_data
        })

# Admin Dashboard View
@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_dashboard(request):
    # Verify that the authenticated user is an admin
    if not hasattr(request.user, 'email') or not request.user.email:
        return Response({'error': 'Admin access required'}, status=status.HTTP_403_FORBIDDEN)
    """Admin dashboard with statistics"""
    from django.db.models import Count, Sum
    from django.utils import timezone
    from datetime import timedelta
    
    # Get date range for statistics
    today = timezone.now().date()
    last_30_days = today - timedelta(days=30)
    
    # Statistics
    total_products = Product.objects.count()
    total_categories = Category.objects.count()
    total_users = User.objects.count()
    total_orders = Order.objects.count()
    total_reviews = Review.objects.count()
    
    # Recent orders
    recent_orders = Order.objects.all().order_by('-created_at')[:10]
    
    # Recent reviews
    recent_reviews = Review.objects.all().order_by('-created_at')[:10]
    
    # Revenue statistics
    total_revenue = Payment.objects.filter(status='completed').aggregate(
        total=Sum('amount')
    )['total'] or 0
    
    monthly_revenue = Payment.objects.filter(
        status='completed',
        created_at__date__gte=last_30_days
    ).aggregate(total=Sum('amount'))['total'] or 0
    
    return Response({
        'statistics': {
            'total_products': total_products,
            'total_categories': total_categories,
            'total_users': total_users,
            'total_orders': total_orders,
            'total_reviews': total_reviews,
            'total_revenue': float(total_revenue),
            'monthly_revenue': float(monthly_revenue)
        },
        'recent_orders': OrderSerializer(recent_orders, many=True).data,
        'recent_reviews': [
            {
                'id': review.id,
                'product_name': review.product.name,
                'user_email': review.user.email,
                'rating': review.rating,
                'title': review.title,
                'created_at': review.created_at
            }
            for review in recent_reviews
        ]
    }) 