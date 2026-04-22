from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import UserSerializer, UserRegisterSerializer
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

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
                    samesite='Lax',
                    path='/',
                )
                response.set_cookie(
                    key='refresh_token',
                    value=str(refresh),
                    httponly=True,
                    samesite='Lax',
                    path='/api/token/refresh/' 
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
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.cookies.get('refresh_token')
        
        if not refresh_token:
            return Response({"error": "Refresh token missing"}, status=status.HTTP_401_UNAUTHORIZED)

        # Faccio una nuova richiesta al serializer di simpleJWT per la generazione del nuovo token
        request.data['refresh'] = refresh_token

        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
        except (InvalidToken, TokenError):
            return Response({"error": "Token not valid"}, status=status.HTTP_401_UNAUTHORIZED)

        # Il nuovo token è stato generato con successo
        response = Response({"detail": "Token updated"}, status=status.HTTP_200_OK)
        
        # Settiamo il nuovo access token nel cookie
        response.set_cookie(
            key='access_token',
            value=serializer.validated_data['access'],
            httponly=True,
            secure=False,
            samesite='Lax',
            max_age=3600
        )
        return response
    
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        response = Response({'message':'Logout successful !'}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response
        