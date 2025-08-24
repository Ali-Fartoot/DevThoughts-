from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .serializers import SignupSerializer, LoginSerializer, UserPanelSerializer
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.permissions import AllowAny
from minio_api import MinioClient
from django.http import HttpResponse

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    API endpoint for user signup
    """
    if request.method == 'POST':
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User created successfully',
                'username': user.username,
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        print("Signup validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoginView(ObtainAuthToken):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data,
                                    context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key,
                             'user_id': user.pk,
                             'username': user.username
            })
        
        return Response(serializer.errors, status=400)
    
class UserPanelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        profile = user.profile
        serializer = UserPanelSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

@api_view(["DELETE", "POST"])
@permission_classes([IsAuthenticated])
def update_profile_picture(request):
    minio_client = MinioClient().get_client()
    bucket_name = "profile-pictures"
    object_name = f"{request.user.id}_profile.jpg"

    if request.method == "POST":
        
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        file_path = f"/dynamic/{object_name}"

        with open(file_path, 'wb') as f:
            for chunk in file.chunks():
                f.write(chunk)
        
        
        if minio_client.put_object(bucket_name, object_name, file_path):
            return Response(status=status.HTTP_200_OK)
        else:
            return Response({"error": "Error while putting"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    if request.method == "DELETE":
 
            if minio_client.delete_object(bucket_name, object_name):
                return Response({"message": "Profile picture deleted successfully"}, status=status.HTTP_200_OK)

            return Response({"error": "Profile picture deletion failed"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_profile_picture(request):
    target_id = request.query_params.get('id', request.user.id)

    try:
        target_id = int(target_id)
    except (ValueError, TypeError):
        return Response({"error": "Invalid user ID"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        User.objects.get(id=target_id)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    minio_client = MinioClient().get_client()
    bucket_name = "profile-pictures"
    object_name = f"{target_id}_profile.jpg"
    file_path = f"/dynamic/{object_name}"

    object = minio_client.get_object(bucket_name, object_name, file_path)
    if object:
        with open(file_path, 'rb') as f:
            image_data = f.read()

        return HttpResponse(image_data, content_type='image/jpeg')

    return Response({"error": f"Failed to retrieve profile picture"}, status=status.HTTP_404_NOT_FOUND)



@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_id(request):
    username = request.query_params.get('username')
    if not username:
        return Response({"error": "Username parameter is required"},status=status.HTTP_400_BAD_REQUEST)
 
    try:
        user = User.objects.get(username=username)
        return Response({"user_id": user.id}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
       return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
