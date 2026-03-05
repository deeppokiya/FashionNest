from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('products/', views.ProductListView.as_view(), name='product-list'),
    path('products/create/', views.ProductCreateView.as_view(), name='product-create'),
    path('products/featured/', views.featured_products, name='featured-products'),
    path('products/sale/', views.sale_products, name='sale-products'),
    path('products/<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('products/<slug:slug>/update/', views.ProductUpdateView.as_view(), name='product-update'),
    path('products/<slug:product_slug>/reviews/', views.ReviewListView.as_view(), name='review-list'),
    path('products/<slug:slug>/check-purchase/', views.check_purchase_status, name='check-purchase-status'),
    path('products/<slug:slug>/check-review/', views.check_review_status, name='check-review-status'),
    path('products/<slug:slug>/review-with-order/', views.create_review_with_order, name='create-review-with-order'),
] 