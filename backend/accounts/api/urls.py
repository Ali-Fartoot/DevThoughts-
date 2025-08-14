from django.urls import path
from . import views

urlpatterns = [
    path('accounts/signup/', views.signup, name='api_signup'),
    path('accounts/login/', views.LoginView.as_view(), name='api_login'),
    path('user/<str:username>/', views.UserPanelView.as_view(), name='get_profile')
]