import stripe
from django.conf import settings
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Payment
from .serializers import PaymentSerializer, PaymentCreateSerializer, StripePaymentIntentSerializer, PaymentConfirmSerializer
from orders.models import Order
from orders.tasks import process_payment_details
from django.utils import timezone
from django.shortcuts import render
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentListView(generics.ListAPIView):
    """List user's payments"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Payment.objects.filter(order__user=self.request.user)

class PaymentDetailView(generics.RetrieveAPIView):
    """Get payment details"""
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Payment.objects.filter(order__user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Create Stripe payment intent"""
    serializer = StripePaymentIntentSerializer(data=request.data)
    if serializer.is_valid():
        order_id = serializer.validated_data['order_id']
        payment_method_id = serializer.validated_data.get('payment_method_id')
        
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if order is already paid
        if order.payment_status == 'completed':
            return Response({'error': 'Order is already paid'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create payment intent with timeout handling
            intent_data = {
                'amount': int(order.total_amount * 100),  # Convert to cents
                'currency': 'usd',
                'metadata': {
                    'order_id': order.id,
                    'order_number': order.order_number,
                    'user_id': request.user.id
                },
                'automatic_payment_methods': {
                    'enabled': True,
                },
                'confirmation_method': 'manual',
                'confirm': False,  # Don't confirm immediately
            }
            
            if payment_method_id:
                intent_data['payment_method'] = payment_method_id
            
            payment_intent = stripe.PaymentIntent.create(**intent_data)
            
            # Create or update payment record with enhanced details
            payment_data = {
                'amount': order.total_amount,
                'payment_method': 'stripe',
                'payment_intent_id': payment_intent.id,
                'status': 'pending',
                'currency': 'USD',
                'billing_name': f"{request.user.first_name} {request.user.last_name}".strip(),
                'billing_email': request.user.email,
                'billing_phone': order.shipping_phone,
                'billing_address': order.shipping_address,
                'billing_city': order.shipping_city,
                'billing_state': order.shipping_state,
                'billing_zip_code': order.shipping_zip_code,
                'billing_country': order.shipping_country,
            }
            
            payment, created = Payment.objects.get_or_create(
                order=order,
                defaults=payment_data
            )
            
            if not created:
                # Update existing payment with new intent
                payment.payment_intent_id = payment_intent.id
                payment.save()
            
            # Trigger payment details processing task
            process_payment_details.delay(payment.id)
            
            return Response({
                'client_secret': payment_intent.client_secret,
                'payment_intent_id': payment_intent.id,
                'amount': payment_intent.amount,
                'currency': payment_intent.currency,
                'payment_id': payment.id,
                'order_id': order.id,
                'order_number': order.order_number
            })
            
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'Payment processing failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    """Confirm payment after successful processing"""
    serializer = PaymentConfirmSerializer(data=request.data)
    if serializer.is_valid():
        payment_intent_id = serializer.validated_data['payment_intent_id']
        order_id = serializer.validated_data['order_id']
        
        try:
            payment = Payment.objects.get(
                payment_intent_id=payment_intent_id,
                order_id=order_id,
                order__user=request.user
            )
            
            # Retrieve payment intent from Stripe
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if payment_intent.status == 'succeeded':
                payment.status = 'completed'
                payment.transaction_id = payment_intent.charges.data[0].id if payment_intent.charges.data else payment_intent_id
                payment.processed_at = timezone.now()
                payment.save()
                
                # Update order payment status
                order = payment.order
                order.payment_status = 'completed'
                order.transaction_id = payment.transaction_id
                order.save()
                
                # Trigger detailed payment processing
                process_payment_details.delay(payment.id)
                
                # Send payment confirmation email
                try:
                    from orders.tasks import send_payment_confirmation_email
                    result = send_payment_confirmation_email(order.id)
                    print(f"✅ Payment confirmation email sent to {order.user.email}")
                    print(f"📧 Email result: {result}")
                except Exception as e:
                    print(f"⚠️ Failed to send payment confirmation email: {str(e)}")
                    print(f"🔍 Error details: {type(e).__name__}: {str(e)}")
                
                return Response({
                    'message': 'Payment confirmed successfully',
                    'payment': PaymentSerializer(payment).data,
                    'order_status': order.status,
                    'payment_status': order.payment_status
                })
            else:
                payment.status = 'failed'
                payment.error_message = f"Payment intent status: {payment_intent.status}"
                payment.save()
                
                # Update order payment status to failed
                order = payment.order
                order.payment_status = 'failed'
                order.save()
                
                return Response({
                    'error': 'Payment failed',
                    'payment_status': payment_intent.status
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Payment.DoesNotExist:
            return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'Payment confirmation failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def simple_confirm_payment(request):
    """Simple payment confirmation for PayPal and other payment methods"""
    try:
        order_id = request.data.get('order_id')
        payment_method = request.data.get('payment_method', 'paypal')
        transaction_id = request.data.get('transaction_id', '')
        
        if not order_id:
            return Response({'error': 'Order ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the order
        try:
            order = Order.objects.get(id=order_id, user=request.user)
        except Order.DoesNotExist:
            return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if order is already paid
        if order.payment_status == 'completed':
            return Response({
                'message': 'Order is already paid',
                'order_status': order.status,
                'payment_status': order.payment_status,
                'order_id': order.id,
                'order_number': order.order_number
            })
        
        # Generate transaction ID if not provided
        if not transaction_id:
            transaction_id = f"{payment_method}_{order.order_number}_{int(timezone.now().timestamp())}"
        
        # Create or update payment record
        payment_data = {
            'amount': order.total_amount,
            'payment_method': payment_method,
            'status': 'completed',
            'transaction_id': transaction_id,
            'currency': 'USD',
            'billing_name': f"{request.user.first_name} {request.user.last_name}".strip() or request.user.username,
            'billing_email': request.user.email,
            'billing_phone': getattr(order, 'shipping_phone', ''),
            'billing_address': getattr(order, 'shipping_address', ''),
            'billing_city': getattr(order, 'shipping_city', ''),
            'billing_state': getattr(order, 'shipping_state', ''),
            'billing_zip_code': getattr(order, 'shipping_zip_code', ''),
            'billing_country': getattr(order, 'shipping_country', ''),
            'processed_at': timezone.now(),
        }
        
        try:
            payment, created = Payment.objects.get_or_create(
                order=order,
                defaults=payment_data
            )
            
            if not created:
                # Update existing payment
                for key, value in payment_data.items():
                    setattr(payment, key, value)
                payment.save()
            
            # Update order payment status
            order.payment_status = 'completed'
            order.transaction_id = payment.transaction_id
            order.save()
            
            print(f"✅ Payment confirmed for order {order.order_number}")
            
            # Send payment confirmation email immediately
            try:
                from orders.tasks import send_payment_confirmation_email
                # Call the function directly to avoid any Celery issues
                result = send_payment_confirmation_email(order.id)
                print(f"✅ Payment confirmation email sent to {order.user.email}")
                print(f"📧 Email result: {result}")
            except Exception as e:
                print(f"⚠️ Failed to send payment confirmation email: {str(e)}")
                print(f"🔍 Error details: {type(e).__name__}: {str(e)}")
                # Continue with payment confirmation even if email fails
            
            return Response({
                'message': 'Payment confirmed successfully',
                'order_id': order.id,
                'order_number': order.order_number,
                'order_status': order.status,
                'payment_status': order.payment_status,
                'payment_id': payment.id,
                'transaction_id': payment.transaction_id
            })
            
        except Exception as e:
            print(f"❌ Payment creation/update error: {str(e)}")
            return Response({
                'error': f'Payment processing failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    except Exception as e:
        print(f"❌ Payment confirmation error: {str(e)}")
        return Response({
            'error': f'Payment confirmation failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_payment_status(request, order_id):
    """Check payment status for an order"""
    try:
        order = Order.objects.get(id=order_id, user=request.user)
        
        # Get payment details if exists
        payment_data = None
        if hasattr(order, 'payment'):
            payment_data = PaymentSerializer(order.payment).data
        
        return Response({
            'order_id': order.id,
            'order_number': order.order_number,
            'payment_status': order.payment_status,
            'order_status': order.status,
            'payment_details': payment_data,
            'total_amount': str(order.total_amount)
        })
        
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error checking payment status: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refund_payment(request, payment_id):
    """Refund a payment"""
    try:
        payment = Payment.objects.get(id=payment_id, order__user=request.user)
        
        if payment.status != 'completed':
            return Response({'error': 'Payment cannot be refunded'}, status=status.HTTP_400_BAD_REQUEST)
        
        if payment.payment_intent_id:
            # Refund through Stripe
            refund = stripe.Refund.create(payment_intent=payment.payment_intent_id)
            
            payment.status = 'refunded'
            payment.save()
            
            # Update order status
            order = payment.order
            order.status = 'refunded'
            order.save()
            
            return Response({
                'message': 'Payment refunded successfully',
                'refund_id': refund.id
            })
        else:
            return Response({'error': 'Cannot refund this payment method'}, status=status.HTTP_400_BAD_REQUEST)
            
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)
    except stripe.error.StripeError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': 'Refund failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_confirmation_page(request, order_id):
    """Render payment confirmation page"""
    try:
        order = Order.objects.get(id=order_id, user=request.user)
        
        # Get payment details
        payment = None
        if hasattr(order, 'payment'):
            payment = order.payment
        
        context = {
            'order': order,
            'payment': payment,
        }
        
        return render(request, 'payment_confirmation.html', context)
        
    except Order.DoesNotExist:
        return HttpResponse("Order not found", status=404)
    except Exception as e:
        return HttpResponse(f"Error: {str(e)}", status=500) 