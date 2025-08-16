from django.db import models
from accounts.models import Profile

class UserPreferences(models.Model):

    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    timezone = models.CharField(max_length=50, default='UTC')
    profile_visibility = models.CharField(max_length=20, choices=[
        ('public', 'Public'),
        ('friends', 'Followers Only'),
        ('private', 'Private')
    ], default='public')

    show_email = models.BooleanField(default=False)

    def __str__(self):
        if self.profile and self.profile.user:
            return f"{self.profile.user.username} Preferences"
        elif self.profile:
           return f"Preferences for Profile ID {self.profile.id}"
        else:
            return f"UserPreferences (ID: {self.id}) - No Profile Assigned"
    
    class Meta:
        verbose_name = 'User Preference'
        

