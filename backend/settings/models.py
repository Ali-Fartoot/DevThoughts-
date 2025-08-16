from django.db import models
from django.contrib.auth.models import User

class UserPreferences(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    timezone = models.CharField(max_length=50, default='UTC')
    profile_visibility = models.CharField(max_length=20, choices=[
        ('public', 'Public'),
        ('friends', 'Followers Only'),
        ('private', 'Private')
    ], default='public')

    show_email = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} Preferences"
    
    class Meta:
        verbose_name = 'User Preference'
        

