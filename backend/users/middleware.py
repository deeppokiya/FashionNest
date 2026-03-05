from django.utils.functional import SimpleLazyObject
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import Admin, User

def get_admin_user(request):
    """Get admin user from JWT token"""
    if not hasattr(request, '_cached_admin_user'):
        request._cached_admin_user = None
        
        # Get the authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
            try:
                # Decode the token
                access_token = AccessToken(token)
                
                # Check if it's an admin token
                is_admin = access_token.get('is_admin', False)
                if is_admin:
                    admin_id = access_token.get('admin_id')
                    if admin_id:
                        try:
                            admin = Admin.objects.get(id=admin_id, is_active=True)
                            request._cached_admin_user = admin
                        except Admin.DoesNotExist:
                            pass
                            
            except (InvalidToken, TokenError):
                pass
    
    return request._cached_admin_user

class AdminAuthenticationMiddleware:
    """Middleware to authenticate admin users from JWT tokens"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # Add admin user to request
        request.admin = SimpleLazyObject(lambda: get_admin_user(request))
        
        response = self.get_response(request)
        return response



