from .consumers import WSConsumerChatChannels
from django.urls import re_path

ws_urlpatterns = [
    re_path(r"^ws/chat/(?P<chat_name>\w+)/$", WSConsumerChatChannels.as_asgi()),
]
