from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from accounts.decorators import user_exists_required


@user_exists_required
def settings_view(request, username):
    return render(request, 'settings/settings.html', {'username': username})

@user_exists_required
def profile_settings_view(request, username):
    return render(request, 'settings/profile_settings.html', {'username': username})

@user_exists_required
def privacy_settings_view(request, username):
    return render(request, 'settings/privacy_settings.html', {'username': username})

@user_exists_required
def display_settings_view(request, username):
    return render(request, 'settings/display_settings.html', {'username': username})

@user_exists_required
def back_to_profile(request, username):
    return redirect('blog:panel', username=username)
