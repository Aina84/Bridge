from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User
from .serializers import UserSerializer

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'accessToken': str(refresh.access_token),
        'refreshToken': str(refresh),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('email')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if not user:
        try:
            u = User.objects.get(email=username)
            user = authenticate(username=u.username, password=password)
        except User.DoesNotExist:
            pass

    if user:
        tokens = get_tokens_for_user(user)
        serializer = UserSerializer(user)
        return Response({
            'user': serializer.data,
            'tokens': tokens
        }, status=status.HTTP_200_OK)
    return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    data = request.data
    username = data.get('username') or data.get('email') 
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstName', '')
    last_name = data.get('lastName', '')
    role_id = data.get('role')

    if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
        return Response({'detail': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        role_id=role_id,
    )
    
    tokens = get_tokens_for_user(user)
    serializer = UserSerializer(user)
    return Response({
        'user': serializer.data,
        'tokens': tokens
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    return Response({'detail': 'Logged out successfully'}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    refresh_token = request.data.get('refreshToken')
    if not refresh_token:
        return Response({'detail': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        refresh = RefreshToken(refresh_token)
        return Response({
            'accessToken': str(refresh.access_token),
            'refreshToken': str(refresh),
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'detail': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
