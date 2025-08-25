from django.urls import path
from . import views

urlpatterns = [
    path('accounts/signup/', views.signup, name='api_signup'),
    path('accounts/login/', views.LoginView.as_view(), name='api_login'),
    path('accounts/user-id/', views.get_user_id, name='get-user-id'),
    path('accounts/profile/put/', views.update_profile_picture, name='update-profile-picture'),
    path('accounts/profile/', views.get_profile_picture, name='get-profile-picture'),
    path('user/<str:username>/', views.UserPanelView.as_view(), name='get_profile'),
]