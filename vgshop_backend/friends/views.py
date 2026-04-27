from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Friend
from .serializers import FriendSerializer

class CataloguePaginator(PageNumberPagination):
    page_size=10

class FriendsModelViewSet(viewsets.ModelViewSet):
    
    queryset = Friend.objects.all()
    serializer_class = FriendSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = CataloguePaginator

    @action(detail=False, methods=["GET"])
    def get_friend_list(self, request):
        user = request.user
        friend_list = self.get_queryset().filter(first_friend=user).union(self.get_queryset().filter(second_friend=user))
        serializer = FriendSerializer(friend_list, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)