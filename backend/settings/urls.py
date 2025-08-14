from django.urls import path
from . import views

app_name = 'settings'

urlpatterns = [
    path('<str:username>/', views.settings_view, name='settings_menu'),
    path('<str:username>/profile/', views.profile_settings_view, name='profile_settings'),
    path('<str:username>/privacy/', views.privacy_settings_view, name='privacy_settings'),
    path('<str:username>/display/', views.display_settings_view, name='display_settings'),
    
]