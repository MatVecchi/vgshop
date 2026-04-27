from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .models import Friend

def get_user_from_token(raw_token):
    return "token"

class ListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        
        raw_token = request.COOKIES.get('access_token')

        if not raw_token:
            print("Access token not found")
            return Response({'message': 'Token not found'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = get_user_from_token(raw_token=raw_token)
        if user:
            return Response({'list': []}, status=status.HTTP_200_OK)
        else:
            return Response({'message': 'User not found'}, status=status.HTTP_401_UNAUTHORIZED)
         