from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from accounts.decorators import user_exists_required


@user_exists_required
def settings_view(request, user_id):
    return render(request, 'settings/settings.html', {'user_id': user_id})

@user_exists_required
def profile_settings_view(request, user_id):
    return render(request, 'settings/profile_settings.html', {'user_id': user_id})

@user_exists_required
def privacy_settings_view(request, user_id):
    return render(request, 'settings/privacy_settings.html', {'user_id': user_id})

@user_exists_required
def display_settings_view(request, user_id):
    return render(request, 'settings/display_settings.html', {'user_id': user_id})
