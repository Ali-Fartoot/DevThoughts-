from django.urls import path
from . import views

app_name = 'settings'

urlpatterns = [
    path('profile/update/', views.update_profile, name='profile_settings'), 
    path('<str:username>/', views.get_user_settings, name='user_settings'),
]