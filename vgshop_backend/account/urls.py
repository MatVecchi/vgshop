from django.urls import path, include
from .views import LoginView, RegisterView, TokenRefreshView, LogoutView, ProfileView, UsernameView

urlpatterns = [
    path('login/', LoginView.as_view(), name="login"),
    path('logout/', LogoutView.as_view(), name="logout"),
    path('register/', RegisterView.as_view(), name="register"),
    path('token/refresh/', TokenRefreshView.as_view(), name="token_refresh"),
    path('profile/', ProfileView.as_view(), name="profile"),
    path('username/', UsernameView.as_view(), name="username" )
]