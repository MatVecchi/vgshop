from .views import ReviewViewSet
from django.urls import path, include


urlpatterns = [
    path(
        "reviews/<str:game>/",
        ReviewViewSet.as_view({"get": "list"}),
        name="review-game",
    ),
    path(
        "reviews/",
        ReviewViewSet.as_view({"post": "create"}),
        name="review-create",
    ),
]
