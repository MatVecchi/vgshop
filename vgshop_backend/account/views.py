from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserSerializer, UserRegisterSerializer
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import User

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password')
            
            user = authenticate(username=username, password=password)
            if user:
                refresh = RefreshToken.for_user(user)
                response = Response({
                    'user': UserSerializer(user).data,
                    'message': 'Login successful !'
                })
                
                response.set_cookie(
                    key='access_token', 
                    value=str(refresh.access_token),
                    httponly=True, 
                    secure=False, # In produzione metti True
                    max_age=60*15, # 15 minuti
                    samesite='Lax',
                    path='/',
                )
                response.set_cookie(
                    key='refresh_token',
                    value=str(refresh),
                    httponly=True,
                    secure=False,
                    max_age=60*60*24*30, # 30 giorni
                    samesite='Lax',
                    path='/api/token/refresh/', 
                )
                return response
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({'message': 'Server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data = request.data)

        if serializer.is_valid():
            serializer.save()

            return Response(
                {'message':'Registration completed !'},
                status= status.HTTP_201_CREATED
            )
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TokenRefreshView(TokenRefreshView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')
        
        if not refresh_token:
            print("Refresh token mancante nei cookie")
            return Response({"error": "Refresh token missing"}, status=status.HTTP_401_UNAUTHORIZED)

        request.data['refresh'] = refresh_token

        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
        except (InvalidToken, TokenError):
            print("Token non valido o scaduto")
            return Response({"error": "Token not valid"}, status=status.HTTP_401_UNAUTHORIZED)

        response = Response({"detail": "Token updated"}, status=status.HTTP_200_OK)
        
        response.set_cookie(
            key='access_token',
            value=serializer.validated_data['access'],
            httponly=True,
            secure=False, # In produzione metti True
            max_age=60*15, # 15 minuti
            samesite='Lax',
            path='/',
        )

        if 'refresh' in serializer.validated_data:
            response.set_cookie(
                key='refresh_token',
                value=serializer.validated_data['refresh'],
                httponly=True,
                secure=False,
                max_age=60*60*24*30, # 30 giorni
                samesite='Lax',
                path='/api/token/refresh/',
            )

        return response
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        response = Response({'message':'Logout successful !'}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response
    

def get_user_from_token(raw_token):
    try:
        token = AccessToken(raw_token)
        return User.objects.get(id=token['user_id'])
    except (User.DoesNotExist, Exception):
        return None
        

class UsernameView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        
        raw_token = request.COOKIES.get('access_token')
        if not raw_token:
            return Response({'message': 'Token not found'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = get_user_from_token(raw_token=raw_token)
        if user:
            return Response({'username':user.username, 'profile_image':user.profile_image if user.profile_image else None}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
        
        
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        
        raw_token = request.COOKIES.get('access_token')
        if not raw_token:
            return Response({'message': 'Token not found'}, status=status.HTTP_401_UNAUTHORIZED)
          
        user = get_user_from_token(raw_token=raw_token)
        serializer = UserSerializer(user)
        if user:
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)