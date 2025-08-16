from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import Profile
from settings.models import UserPreferences

@receiver(post_save, sender=User)
def create_user_profile_and_preferences(sender, instance, created, **kwargs):
    """
    Signal handler to create a Profile and UserPreferences whenever a new User is created.
    """
    if created:
        Profile.objects.create(user=instance)
        UserPreferences.objects.create(user=instance)

