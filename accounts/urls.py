from django.urls import path, include
from . import views as account_views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('signup/', account_views.signup, name='signup'),
    path('login/', account_views.login, name='login'),

    path('<int:user_id>/', account_views.user_profile_view, name='user_profile'),
]