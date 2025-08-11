from django.shortcuts import render
from accounts.decorators import user_exists_required

@user_exists_required
def blog_view(request, username):
    return render(request, 'blogs/blog_panel.html', {'username': username})

@user_exists_required
def post_blog(request, username):
    return render(request, 'blogs/post.html', {'username': username})