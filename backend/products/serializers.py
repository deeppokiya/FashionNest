from rest_framework import serializers
from .models import Category, Product, ProductImage, Review

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image']

class ProductImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary']
    
    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    verified_badge = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'user_name', 'rating', 'title', 'comment', 'is_verified_purchase', 'verified_badge', 'is_submitted', 'can_edit', 'created_at']
        read_only_fields = ['user', 'is_submitted', 'can_edit']
    
    def get_verified_badge(self, obj):
        if obj.is_verified_purchase:
            return "✅ Verified Purchase"
        return None
    
    def get_can_edit(self, obj):
        # Reviews cannot be edited once submitted
        return False

class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    images = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)
    is_on_sale = serializers.ReadOnlyField()
    current_price = serializers.ReadOnlyField()
    
    def get_images(self, obj):
        return ProductImageSerializer(obj.images.all(), many=True, context=self.context).data
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'sale_price',
            'category', 'brand', 'gender', 'sizes', 'colors', 'stock_quantity',
            'is_active', 'is_featured', 'rating', 'num_reviews', 'images',
            'reviews', 'is_on_sale', 'current_price', 'created_at'
        ]

class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    is_on_sale = serializers.ReadOnlyField()
    current_price = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'price', 'sale_price', 'category',
            'gender', 'rating', 'num_reviews', 'primary_image', 'is_on_sale',
            'current_price', 'is_featured'
        ]
    
    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return ProductImageSerializer(primary_image, context=self.context).data
        return None

class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'name', 'slug', 'description', 'price', 'sale_price', 'category',
            'brand', 'gender', 'sizes', 'colors', 'stock_quantity', 'is_active',
            'is_featured'
        ]

class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['rating', 'title', 'comment']
    
    def validate(self, data):
        """Validate that user can only submit one review per product after delivery"""
        user = self.context['request'].user
        product_id = self.context['product_id']
        
        # Check if user has already submitted a review for this product
        if Review.objects.filter(user=user, product_id=product_id).exists():
            raise serializers.ValidationError(
                "You have already submitted a review for this product. Reviews cannot be edited or resubmitted."
            )
        
        # Check if user has purchased and received this product
        from orders.models import OrderItem
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            product_id=product_id,
            order__status='delivered'  # Only count delivered orders
        ).exists()
        
        if not has_purchased:
            raise serializers.ValidationError(
                "You can only review products that you have purchased and received. Please wait until your order is delivered."
            )
        
        return data
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        validated_data['product_id'] = self.context['product_id']
        
        # Check if user has purchased and received this product
        from orders.models import OrderItem
        user = self.context['request'].user
        product_id = self.context['product_id']
        
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            product_id=product_id,
            order__status='delivered'  # Only count delivered orders
        ).exists()
        
        validated_data['is_verified_purchase'] = has_purchased
        validated_data['is_submitted'] = True  # Mark as submitted (non-editable)
        return super().create(validated_data) 