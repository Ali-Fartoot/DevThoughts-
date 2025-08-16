from django.urls import path
from . import views

app_name = 'settings'

urlpatterns = [
    path('<str:username>/profile/', views.update_profile, name='profile_settings'), # Updated to use update_profile view
    
]