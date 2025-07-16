from django import forms
from .models import UserPreferences
from accounts.models import Profile

class UserPreferencesForm(forms.ModelForm):
    class Meta:
        model = UserPreferences
        fields = ['timezone', 'profile_visibility', 'show_phone', 'show_email']
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['show_phone'].required = False
        self.fields['show_email'].required = False

class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = ['sex']