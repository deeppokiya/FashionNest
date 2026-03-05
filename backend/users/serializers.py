from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Admin

class UserSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source='phone', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'phone', 'phone_number', 'address', 'city', 'state', 'zip_code', 'country', 'date_of_birth', 'profile_picture']
        read_only_fields = ['id']

class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    phone_number = serializers.CharField(source='phone', required=False, write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'phone', 'phone_number', 'address', 'city', 'state', 'zip_code', 'country', 'date_of_birth', 'profile_picture']
        read_only_fields = ['email']  # Email should not be changed via profile update
        extra_kwargs = {
            'username': {'required': False},  # Make username optional for updates
        }

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'phone', 'address', 'date_of_birth']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid email or password')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include email and password')
        
        return attrs

# Admin Serializers
class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Admin
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'is_superuser', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']

class AdminRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = Admin
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'is_superuser']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        # Hash the password
        from django.contrib.auth.hashers import make_password
        validated_data['password'] = make_password(validated_data['password'])
        admin = Admin.objects.create(**validated_data)
        return admin

class AdminLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            try:
                admin = Admin.objects.get(username=username, is_active=True)
                from django.contrib.auth.hashers import check_password
                if not check_password(password, admin.password):
                    raise serializers.ValidationError('Invalid username or password')
                attrs['admin'] = admin
            except Admin.DoesNotExist:
                raise serializers.ValidationError('Invalid username or password')
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return attrs 