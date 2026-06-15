from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from friends.views import are_friends
from django.db.models import Q
from account.models import User
from friends.serializers import MessageSerializer
import json


class WSConsumerChatChannels(AsyncWebsocketConsumer):
    @database_sync_to_async
    def check_are_friends(self, users):
        try:
            users = [User.objects.get(username=user) for user in users]
            user_pks = [user.id for user in users]
            friend = user_pks[0] if user_pks[0] != self.me.id else user_pks[1]
            return are_friends(user=self.me.id, friend=friend)
        except Exception:
            return False

    async def connect(self):
        self.me = self.scope["user"]
        print("--- DEBUG WEBSOCKET CONNECT ---")
        print("USER IN SCOPE:", self.scope.get("user"))
        print("SESSION IN SCOPE:", self.scope.get("session"))
        print("HEADERS:", self.scope.get("headers"))
        if not self.me.is_authenticated:
            await self.close()
            return

        self.room_name = self.scope["url_route"]["kwargs"]["chat_name"]
        users = sorted(self.room_name.split("_"))

        are_friends = await self.check_are_friends(users)
        if are_friends:
            self.room_group_name = "chat_" + self.room_name
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def chatroom_message(self, event):
        serialized_meessage = event["message"]
        if self.me.username == serialized_meessage["sender"]:
            return
        if serialized_meessage:
            await self.send(
                text_data=json.dumps(
                    {"event": "new_message", "message": serialized_meessage}
                )
            )

    async def read_message(self, event):
        message_id = event["message"]
        if message_id:
            await self.send(
                text_data=json.dumps(
                    {"event": "read_message", "message_id": message_id}
                )
            )
