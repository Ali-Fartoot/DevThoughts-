from django.dispatch import receiver
from django.contrib.auth.models import User
from settings.models import UserPreferences
from django.db.models.signals import post_save
from .models import Profile

@receiver(post_save, sender=User)
def create_user_profile_and_preferences(sender, instance, created, **kwargs):
    if created:
        profile, _ = Profile.objects.get_or_create(user=instance)

        UserPreferences.objects.get_or_create(
            profile=profile,
            defaults={
                'show_email': True,
                'profile_visibility': 'public'
            }
        )
