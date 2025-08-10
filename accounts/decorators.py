from functools import wraps
from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden

def user_exists_required(view_func):
    """
    Decorator to ensure a user exists and is authenticated before executing the view.
    Redirects to the login page if the user is not authenticated or to the signup 
    page if the user does not exist.
    """
    @login_required
    @wraps(view_func)
    def _wrapped_view(request, username, *args, **kwargs):
        try:
            target_user = User.objects.get(username=username)

        except User.DoesNotExist:
            return redirect('accounts:signup') 
            
        if request.user.id != target_user.id:
            return redirect('accounts:login')

        return view_func(request, username, *args, **kwargs)
    return _wrapped_view
