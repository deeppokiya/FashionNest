from rest_framework import serializers
from .models import Order, OrderItem, Cart, CartItem
from products.serializers import ProductListSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    total = serializers.ReadOnlyField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'quantity', 'price', 'size', 'color', 'total']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'user_email', 'shipping_address',
            'shipping_city', 'shipping_state', 'shipping_zip_code', 'shipping_country',
            'shipping_phone', 'payment_method', 'payment_status', 'transaction_id',
            'subtotal', 'tax', 'shipping_cost', 'total_amount', 'items',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'order_number', 'user_email', 'created_at', 'updated_at']

class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'user', 'shipping_address', 'shipping_city', 'shipping_state', 'shipping_zip_code',
            'shipping_country', 'shipping_phone', 'payment_method', 'payment_status', 'subtotal',
            'tax', 'shipping_cost', 'total_amount'
        ]

class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    total = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'size', 'color', 'total', 'added_at']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    total_amount = serializers.ReadOnlyField()
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_items', 'total_amount', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class CartItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ['product', 'quantity', 'size', 'color']
    
    def create(self, validated_data):
        user = self.context['request'].user
        cart, created = Cart.objects.get_or_create(user=user)
        
        # Check if item already exists in cart
        existing_item = CartItem.objects.filter(
            cart=cart,
            product=validated_data['product'],
            size=validated_data.get('size', ''),
            color=validated_data.get('color', '')
        ).first()
        
        if existing_item:
            existing_item.quantity += validated_data['quantity']
            existing_item.save()
            return existing_item
        else:
            validated_data['cart'] = cart
            return super().create(validated_data)

class CartItemUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ['quantity'] 