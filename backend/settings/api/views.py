from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import SettingsSerializer 

@api_view(['PUT', 'PATCH']) 
@permission_classes([IsAuthenticated])
def update_profile(request):
    try:
        user_preferences = request.user.userpreferences
    except AttributeError:
         return Response({"error": "User preferences not found for this user."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": "Error retrieving user preferences."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    serializer = SettingsSerializer(instance=user_preferences, data=request.data, partial=request.method == 'PATCH')
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "Profile updated successfully"}, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)