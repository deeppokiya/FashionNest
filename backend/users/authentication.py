from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth.models import AnonymousUser
from .models import Admin, User

class CustomJWTAuthentication(JWTAuthentication):
    """Custom JWT authentication that handles both users and admins"""
    
    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        
        # Check if this is an admin token
        is_admin = validated_token.get('is_admin', False)
        
        if is_admin:
            # Handle admin authentication
            admin_id = validated_token.get('admin_id')
            if not admin_id:
                return None
                
            try:
                admin = Admin.objects.get(id=admin_id, is_active=True)
                return (admin, validated_token)
            except Admin.DoesNotExist:
                return None
        else:
            # Handle regular user authentication
            user_id = validated_token.get('user_id')
            if not user_id:
                return None
                
            try:
                user = User.objects.get(id=user_id, is_active=True)
                return (user, validated_token)
            except User.DoesNotExist:
                return None

