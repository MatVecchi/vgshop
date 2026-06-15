from http.cookies import SimpleCookie
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from account.models import User
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken


@database_sync_to_async
def get_user_from_token(token):
    if not token:
        return AnonymousUser()

    try:
        access_token = AccessToken(token)
        user_id = access_token["user_id"]

        return User.objects.get(id=user_id)
    except (TokenError, InvalidToken, User.DoesNotExist, KeyError):
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        headers = dict(scope.get("headers", []))
        cookies = {}

        # estraggo l'header cookie
        raw_cookie = headers.get(b"cookie")
        if raw_cookie:
            cookie = SimpleCookie()
            # lo decodifico dal binario e popolo il dizionario
            cookie.load(raw_cookie.decode())
            cookies = {key: value.value for key, value in cookie.items()}

        token = cookies.get("access_token")

        scope["user"] = await get_user_from_token(token)

        return await super().__call__(scope, receive, send)