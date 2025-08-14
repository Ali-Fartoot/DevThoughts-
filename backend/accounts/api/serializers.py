from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from accounts.models import Profile
from rest_framework import serializers


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    sex = serializers.ChoiceField(choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')], required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'sex')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("Passwords don't match")
        
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError("Username already exists!")
        return attrs

    def create(self, validated_data):
        sex = validated_data.pop('sex', None)
        validated_data.pop('password2')
        password = validated_data.pop('password')
        
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()

        if sex:
            user.profile.sex = sex
            user.profile.save()
            
        return user
    

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only = True)

    class Meta:
        model = User
        fields = ("username", "password")

    def validate(self, data):
        user = authenticate(**data)

        if user and user.is_active:
            return user
        
        raise serializers.ValidationError("Invalid credentials or inactive user") 
    

class UserPanelSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    
    class Meta:
        model = Profile
        fields = ['username', 'first_name', 'last_name', 'email', 'date_joined', 'sex']