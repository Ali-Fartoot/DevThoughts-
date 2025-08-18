from django.urls import path
from . import views

urlpatterns = [
    path('posts/', views.post_list_create, name='post-list-create'),
    path('posts/<str:post_id>/', views.post_detail, name='post-detail'),
    path('posts/<str:post_id>/like/', views.post_like, name='post-like'),
    path('posts/<str:post_id>/unlike/', views.post_unlike, name='post-unlike'),
]