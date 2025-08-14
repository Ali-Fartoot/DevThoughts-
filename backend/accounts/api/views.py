from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import SignupSerializer, LoginSerializer
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

@api_view(['POST'])
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
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key})
        return Response(serializer.errors, status=400)