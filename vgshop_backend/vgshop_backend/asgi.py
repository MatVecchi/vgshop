"""
ASGI config for vgshop_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.sessions import SessionMiddlewareStack
from django.core.asgi import get_asgi_application
from .middleware import JWTAuthMiddleware
from .routing import ws_urlpatterns

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "vgshop_backend.settings")

# application = get_asgi_application()

application = ProtocolTypeRouter(
    {
        "http": get_asgi_application(),
        "websocket": JWTAuthMiddleware(
            URLRouter(ws_urlpatterns)
        ),
    }
)
