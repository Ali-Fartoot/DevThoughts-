from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from .serializers import SettingsSerializer
from settings.models import UserPreferences

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    try:
        user_preferences, created = UserPreferences.objects.get_or_create(user=request.user)
    except Exception as e:
        return Response({"error": "Error retrieving user preferences."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    serializer = SettingsSerializer(
        instance=user_preferences, 
        data=request.data, 
        partial=True,
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)
    
    print("Validation Errors:", serializer.errors)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_settings(request, username):   
    try:
        user = get_object_or_404(User, username=username)
        user_preferences, created = UserPreferences.objects.get_or_create(user=user)
        
        serializer = SettingsSerializer(instance=user_preferences)  
        return Response(serializer.data, status=status.HTTP_200_OK)   
     
    except Exception as e: 
         return Response(
              {"error": "An error occurred while fetching settings.", "details": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
          )