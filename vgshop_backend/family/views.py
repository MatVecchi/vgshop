from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status, viewsets, mixins
from rest_framework.permissions import IsAuthenticated
from account.serializers import UserProfileSerializer
from account.permissions import IsInCustomerGroup
from account.models import User
from rest_framework.filters import OrderingFilter
from family.serializers import FamilySerializer, FamilyCreateSerializer, FamilyMemberSerializer
from family.models import Family

class FamilyModelViewSet(viewsets.GenericViewSet, mixins.ListModelMixin, mixins.CreateModelMixin, mixins.DestroyModelMixin):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]

    def get_queryset(self):
        user = self.request.user
        if user.family is None:
            return Family.objects.none()
        return Family.objects.filter(pk=user.family.id) 
    
    def get_serializer_class(self):
        if self.action == "create":
            return FamilyCreateSerializer
        return FamilySerializer

class FamilyMemberModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsInCustomerGroup]

    def get_queryset(self):
        user = self.request.user
        if user.family is None:
            return User.objects.none()
        return User.objects.filter(family=user.family)
    
    def get_serializer_class(self):
        if self.action == "create":
            return FamilyMemberSerializer
        return FamilyMemberSerializer