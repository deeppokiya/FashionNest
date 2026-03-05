from django.urls import path
from . import views

urlpatterns = [
    path('payments/', views.PaymentListView.as_view(), name='payment-list'),
    path('payments/<int:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),
    path('payments/create-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('payments/confirm/', views.confirm_payment, name='confirm-payment'),
    path('payments/simple-confirm/', views.simple_confirm_payment, name='simple-payment-confirmation'),
    path('payments/confirmation-page/<int:order_id>/', views.payment_confirmation_page, name='payment-confirmation-page'),
    path('payments/<int:payment_id>/refund/', views.refund_payment, name='refund-payment'),
    path('payments/check-status/<int:order_id>/', views.check_payment_status, name='check-payment-status'),
] 