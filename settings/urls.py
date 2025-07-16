from django.urls import path
from . import views

app_name = 'settings'

urlpatterns = [
    path('', views.settings_view, name='settings'),
    
    path('profile/', views.profile_settings_view, name='profile_settings'),
    path('privacy/', views.privacy_settings_view, name='privacy_settings'),
    path('display/', views.display_settings_view, name='display_settings'),
    
]