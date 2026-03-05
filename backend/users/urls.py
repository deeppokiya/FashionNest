from django.urls import path
from . import views

urlpatterns = [
    # User URLs
    path('register/', views.UserRegistrationView.as_view(), name='user-register'),
    path('login/', views.UserLoginView.as_view(), name='user-login'),
    path('logout/', views.user_logout, name='user-logout'),
    path('profile/', views.UserProfileView.as_view(), name='user-profile'),
    path('update/', views.UserProfileView.as_view(), name='user-update'),  # Alias for profile update
    
    # Admin URLs
    path('admin/register/', views.AdminRegistrationView.as_view(), name='admin-register'),
    path('admin/login/', views.AdminLoginView.as_view(), name='admin-login'),
    path('admin/logout/', views.admin_logout, name='admin-logout'),
    path('admin/profile/', views.AdminProfileView.as_view(), name='admin-profile'),
] 