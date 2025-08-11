from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib import messages
from accounts.decorators import user_exists_required, login_required
from .models import UserPreferences
from .forms import PrivacySettingsForm, DisplaySettingsForm
from accounts.models import Profile
from accounts.forms import UpdateProfileForm

@user_exists_required
def settings_view(request, username):
    return render(request, 'settings/settings.html', {'username': username})

@user_exists_required
def profile_settings_view(request, username):
    if request.method == 'POST':
        form = UpdateProfileForm(request.POST, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated successfully!")
            return redirect("settings:profile_settings", username=request.user.username)
    else:
        form = UpdateProfileForm(instance=request.user)

    return render(request, 'settings/profile_settings.html', {
        'form': form,
        'username': request.user.username
    })


@user_exists_required
def privacy_settings_view(request, username):
    user = User.objects.get(username=username)
    preferences, created = UserPreferences.objects.get_or_create(user=user)
    
    if request.method == 'POST':
        form = PrivacySettingsForm(request.POST, instance=preferences)
        if form.is_valid():
            form.save()
            messages.success(request, 'Privacy settings updated successfully!')
            return redirect('settings:privacy_settings', username=username)
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = PrivacySettingsForm(instance=preferences)
    
    return render(request, 'settings/privacy_settings.html', {
        'username': username,
        'preferences': preferences,
        'form': form
    })

@user_exists_required
def display_settings_view(request, username):
    user = User.objects.get(username=username)
    preferences, created = UserPreferences.objects.get_or_create(user=user)
    
    if request.method == 'POST':
        form = DisplaySettingsForm(request.POST, instance=preferences)
        if form.is_valid():
            form.save()
            messages.success(request, 'Display settings updated successfully!')
            return redirect('settings:display_settings', username=username)
        else:
            messages.error(request, 'Please correct the errors below.')
    else:
        form = DisplaySettingsForm(instance=preferences)
    
    return render(request, 'settings/display_settings.html', {
        'username': username,
        'preferences': preferences,
        'form': form
    })

@user_exists_required
def back_to_profile(request, username):
    return redirect('blog:panel', username=username)
