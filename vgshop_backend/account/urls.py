from account.views import FamilyJoinView, FamilyLeaveView
from django.urls import path, include
from account.views import (
    LoginView,
    RegisterView,
    ProfileUpdateView,
    TokenRefreshView,
    LogoutView,
    ProfileView,
    UsernameView,
    RequestForgotPasswordView,
    ConfirmResetPasswordView,
    ResetPasswordView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("register/", RegisterView.as_view(), name="register"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("username/", UsernameView.as_view(), name="username"),
    path("update/", ProfileUpdateView.as_view(), name="update"),
    path(
        "family/join/<str:family_code>/", FamilyJoinView.as_view(), name="family_join"
    ),
    path("family/leave/", FamilyLeaveView.as_view(), name="family_leave"),
    path("lost_password/", RequestForgotPasswordView.as_view(), name="lost-password"),
    path(
        "lost_password/confirm",
        ConfirmResetPasswordView.as_view(),
        name="confirm-password",
    ),
    path("reset_password/", ResetPasswordView.as_view(), name="reset-password"),
]
