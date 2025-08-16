from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from settings.models import UserPreferences
from rest_framework import serializers
from accounts.models import Profile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Profile
        fields = ['user'] 

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                setattr(user, attr, value)
            user.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class SettingsSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    sex = serializers.CharField(source='profile.sex')
    timezone = serializers.CharField(source='timezone')
    show_email = serializers.BooleanField(source='show_email')
    profile_visibility = serializers.CharField(source='profile_visibility')

    class Meta:
        model = UserPreferences
        fields = ['profile', 'sex', 'timezone', 'show_email', 'profile_visibility']
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        if profile_data:
            profile = instance.profile
            profile_serializer = ProfileSerializer()
            profile_serializer.update(profile, profile_data)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance