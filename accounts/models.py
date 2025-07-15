from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
        user = models.OneToOneField(User, on_delete=models.CASCADE)
        sex = models.CharField(max_length=10, choices=[
            ('male', 'Male'),
            ('female', 'Female'),
            ('other', 'Other')
        ])
        created_at = models.DateTimeField(auto_now_add=True)

        def __str__(self):
            return f"{self.user.username} (Password hidden)"