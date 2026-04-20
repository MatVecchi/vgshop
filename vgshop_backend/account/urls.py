from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView

urlpatterns = [
    path('api/login', LoginView.as_view(), name="login"),
    path('api/token/refresh', TokenRefreshView.as_view(), name="token_refresh"),
]