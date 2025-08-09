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
    @wraps(view_func)
    def _wrapped_view(request, user_id, *args, **kwargs):
        # First check if user is authenticated
        if not request.user.is_authenticated:
            # Redirect to login page if not authenticated
            return redirect('login')
        
        try:
            # Check if the user exists
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            # Redirect to signup if the user is not found
            return redirect('signup')
            
        # Check if the authenticated user is the same as the user in the URL
        if request.user.id != user_id:
            # Return forbidden response if trying to access another user's settings
            return redirect('login')
            
        # If the user exists and is authenticated, proceed with the original view
        return view_func(request, user_id, *args, **kwargs)
    return _wrapped_view
