from django.shortcuts import render
from accounts.decorators import user_exists_required

@user_exists_required
def blog_view(request, user_id):
    return render(request, 'blogs/blog.html', {'user_id': user_id})