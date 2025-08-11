from django.urls import path
from . import views

app_name = 'blog'

urlpatterns = [
    path('<str:username>/', views.blog_view, name='panel'),
    path('<str:username>/post', view=views.post_blog, name='post')
]

