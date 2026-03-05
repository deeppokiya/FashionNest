from django.urls import path
from . import views

urlpatterns = [
    # Cart endpoints
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/add/', views.CartItemCreateView.as_view(), name='cart-add'),
    path('cart/update/<int:item_id>/', views.CartItemUpdateView.as_view(), name='cart-update'),
    path('cart/remove/<int:item_id>/', views.CartItemDeleteView.as_view(), name='cart-remove'),
    path('cart/clear/', views.clear_cart, name='cart-clear'),
    
    # Order endpoints
    path('orders/', views.OrderListView.as_view(), name='order-list'),
    path('orders/create/', views.OrderCreateView.as_view(), name='order-create'),
    path('orders/<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
] 