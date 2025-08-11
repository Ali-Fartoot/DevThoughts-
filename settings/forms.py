from django import forms
from .models import UserPreferences

class PrivacySettingsForm(forms.ModelForm):
    show_phone = forms.BooleanField(required=False)
    show_email = forms.BooleanField(required=False)

    class Meta:
        model = UserPreferences
        fields = ['profile_visibility', 'show_phone', 'show_email']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and hasattr(self.instance, 'pk') and self.instance.pk:
            self.fields['show_phone'].initial = self.instance.show_phone
            self.fields['show_email'].initial = self.instance.show_email
        self.fields['show_phone'].widget.attrs.update({'class': 'toggle-checkbox'})
        self.fields['show_email'].widget.attrs.update({'class': 'toggle-checkbox'})

class DisplaySettingsForm(forms.ModelForm):
    class Meta:
        model = UserPreferences
        fields = ['timezone']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Set default value for timezone field
        if not self.instance or not self.instance.timezone:
            self.fields['timezone'].initial = 'UTC'
