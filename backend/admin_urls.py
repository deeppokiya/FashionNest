from django.urls import path
from . import admin_views

urlpatterns = [
    # Admin Dashboard
    path('dashboard/', admin_views.admin_dashboard, name='admin-dashboard'),
    
    # Admin Product Management
    path('products/', admin_views.AdminProductListView.as_view(), name='admin-products'),
    path('products/create/', admin_views.AdminProductCreateView.as_view(), name='admin-product-create'),
    path('products/<slug:slug>/', admin_views.AdminProductDetailView.as_view(), name='admin-product-detail'),
    
    # Admin Category Management
    path('categories/', admin_views.AdminCategoryListView.as_view(), name='admin-categories'),
    path('categories/<slug:slug>/', admin_views.AdminCategoryDetailView.as_view(), name='admin-category-detail'),
    
    # Admin Payment Management
    path('payments/', admin_views.admin_payment_list, name='admin-payments'),
    path('payments/<int:payment_id>/', admin_views.admin_payment_detail, name='admin-payment-detail'),
    
    # Admin Review Management
    path('reviews/', admin_views.AdminReviewListView.as_view(), name='admin-reviews'),
    path('reviews/<int:pk>/', admin_views.AdminReviewDetailView.as_view(), name='admin-review-detail'),
    
    # Admin Order Management
    path('orders/', admin_views.admin_order_list, name='admin-orders'),
    path('orders/<int:order_id>/', admin_views.admin_order_detail, name='admin-order-detail'),
]
