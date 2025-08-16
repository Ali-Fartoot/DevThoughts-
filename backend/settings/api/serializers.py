from django.contrib.auth.models import User
from settings.models import UserPreferences
from rest_framework import serializers
from accounts.models import Profile

class UserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=150, validators=[])

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email']

    def validate_username(self, value):

        user = self.context['request'].user
        if User.objects.filter(username=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("A user with that username already exists.")
            
        return value

class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Profile
        fields = ['user', 'sex']

class SettingsSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    sex = serializers.ChoiceField(choices=Profile.SEX_CHOICES, write_only=True, required=False)

    class Meta:
        model = UserPreferences
        fields = ['timezone', 'show_email', 'profile_visibility', 'user', 'sex']

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        user = instance.user
        user_serializer = UserSerializer(user, data=user_data, partial=True, context=self.context)
        if user_serializer.is_valid(raise_exception=True):
            user_serializer.save()

        sex_data = validated_data.pop('sex', None)
        if sex_data is not None:
            profile = user.profile 
            profile.sex = sex_data
            profile.save()

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance

