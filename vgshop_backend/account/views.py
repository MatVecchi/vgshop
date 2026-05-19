from friends.views import are_friends
from account.permissions import IsInCustomerGroup
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny, IsAuthenticated
from account.serializers import UserSerializer, UserRegisterSerializer, UserProfileSerializer
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from account.models import User
from wallet.models import Wallet
from django.db import transaction
from family.models import Family
from friends.models import Friend
from django.shortcuts import get_object_or_404
from rest_framework.parsers import MultiPartParser, FormParser

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
                    'user': UserSerializer(user, context={'request': request}).data,
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
                response.set_cookie(
                    key='is_logged_in',
                    value='true',
                    httponly=False, # accessibile dal frontend se serve
                    secure=False,
                    max_age=60*60*24*30, # 30 giorni
                    samesite='Lax',
                    path='/', 
                )
                return response
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({'message': 'Server error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class RegisterView(APIView):
    permission_classes = [AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = UserRegisterSerializer(data = request.data)

        if serializer.is_valid():
            user = serializer.save()
            Wallet.objects.create(user = user)

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
        response.delete_cookie("is_logged_in")
        return response
    

def get_user_from_token(raw_token):
    try:
        token = AccessToken(raw_token)
        return User.objects.get(id=token['user_id'])
    except (User.DoesNotExist, Exception):
        return None
        

class UsernameView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        user = request.user
        serializer = UserProfileSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
        
        
        
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(instance=user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            user.refresh_from_db()
            return Response(UserSerializer(user, context={"request": request}).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        

class FamilyJoinView(APIView):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]
    def put(self, request, family_code):
        raw_token = request.COOKIES.get('access_token')
        if not raw_token:
            return Response({'message': 'Token not found'}, status=status.HTTP_401_UNAUTHORIZED)
        family = get_object_or_404(Family, code=family_code)
        if User.objects.filter(family=family).count() >= 5:
            return Response({'message': 'Family is full'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = request.user
        if not are_friends(user, family.manager):
            return Response({'message': 'Family not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = UserRegisterSerializer(user, data={'family': family.id}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Family joined successfully !'}, status=status.HTTP_200_OK)
        return Response({'message': 'Family join failed', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class FamilyLeaveView(APIView):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]
    def delete(self, request):
        raw_token = request.COOKIES.get('access_token')
        if not raw_token:
            return Response({'message': 'Token not found'}, status=status.HTTP_401_UNAUTHORIZED)
    
        serializer = UserRegisterSerializer(request.user, data={'family': None}, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Family left successfully !'}, status=status.HTTP_200_OK)
        return Response({'message': 'Family left failed', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)