from rest_framework import serializers
from .models import Payment
from orders.serializers import OrderSerializer

class PaymentSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    
    class Meta:
        model = Payment
        fields = [
            'id', 'order', 'amount', 'payment_method', 'status', 'transaction_id',
            'payment_intent_id', 'error_message', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class PaymentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ['order', 'amount', 'payment_method']

class StripePaymentIntentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
    payment_method_id = serializers.CharField(required=False)
    
class PaymentConfirmSerializer(serializers.Serializer):
    payment_intent_id = serializers.CharField()
    order_id = serializers.IntegerField() 