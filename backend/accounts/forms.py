# D:/DevThoughts/accounts/forms.py

from django import forms
from django.contrib.auth.models import User
from .models import Profile
from django.core.exceptions import ValidationError

# This form is for creating a new user and remains unchanged.
class UserRegistrationForm(forms.ModelForm):
    password = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Repeat password', widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ('username', 'email')

    def clean_password2(self):
        cd = self.cleaned_data
        if cd.get('password') != cd.get('password2'):
            raise forms.ValidationError('Passwords don\'t match.')
        return cd.get('password2')
        
    def clean_username(self):
        username = self.cleaned_data.get('username')
        if User.objects.filter(username=username).exists():
            raise forms.ValidationError('A user with that username already exists.')
        return username

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
        return user

# This form is for UPDATING the User and Profile models.
class UpdateProfileForm(forms.ModelForm):
    sex = forms.ChoiceField(choices=[('male', 'Male'), ('female', 'Female'), ('other', 'Other')], required=False)
    phone_number = forms.CharField(max_length=15, required=False)

    class Meta:
        model = User
        fields = ['username', 'email']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and hasattr(self.instance, 'profile'):
            self.fields['sex'].initial = self.instance.profile.sex
            self.fields['phone_number'].initial = self.instance.profile.phone_number

    def save(self, commit=True):
        user = super().save(commit=commit)
        # Then, save the related Profile model data from the explicitly defined form fields
        if commit:
            profile, created = Profile.objects.get_or_create(user=user)
            profile.sex = self.cleaned_data.get('sex')
            profile.phone_number = self.cleaned_data.get('phone_number')
            profile.save()
            
        return user