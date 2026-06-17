from account.views import FamilyJoinView, FamilyLeaveView
from django.urls import path
from account.views import AccountViewSet

urlpatterns = [
    path("login/", AccountViewSet.as_view({"post": "login"}), name="login"),
    path("logout/", AccountViewSet.as_view({"get": "logout"}), name="logout"),
    path("register/", AccountViewSet.as_view({"post": "register"}), name="register"),
    path(
        "token/refresh/",
        AccountViewSet.as_view({"post": "token_refresh"}),
        name="token_refresh",
    ),
    path("profile/", AccountViewSet.as_view({"get": "profile"}), name="profile"),
    path("username/", AccountViewSet.as_view({"get": "username"}), name="username"),
    path("update/", AccountViewSet.as_view({"patch": "update_profile"}), name="update"),
    path(
        "lost_password/",
        AccountViewSet.as_view({"post": "lost_password"}),
        name="lost-password",
    ),
    path(
        "lost_password/confirm/",
        AccountViewSet.as_view({"post": "confirm_password"}),
        name="confirm-password",
    ),
    path(
        "reset_password/",
        AccountViewSet.as_view({"post": "reset_password"}),
        name="reset-password",
    ),
    path(
        "family/join/<str:family_code>/", FamilyJoinView.as_view(), name="family_join"
    ),
    path("family/leave/", FamilyLeaveView.as_view(), name="family_leave"),
    
]
