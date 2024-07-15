# app/routing.py

from django.urls import re_path
from game.consumers import PongConsumer

websocket_urlpatterns = [
    re_path(r'ws/pong/(?P<room_name>\w+)/$', PongConsumer.as_asgi()),
]
