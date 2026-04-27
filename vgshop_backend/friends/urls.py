from django.urls import path, include
from .views import ListView

urlpatterns = [
    path('friends/', ListView.as_view(), name="friends"),
]