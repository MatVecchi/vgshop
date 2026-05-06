from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status, viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from account.serializers import UserProfileSerializer
from account.permissions import IsInCustomerGroup
from rest_framework.filters import OrderingFilter
from .serializers import FamilySerializer
from .models import Family

class FamilyModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]
    serializer_class = FamilySerializer
    queryset = Family.objects.all()
    