from django.urls import path
from .views import SearchPostsView

urlpatterns = [
    path('search/', SearchPostsView.as_view(), name='search-posts'),
]