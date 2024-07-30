from django.urls import path
from game.consumers import GameConsumer
from users.consumers import StatusConsumer

websocket_urlpatterns = [
    path('game/', GameConsumer.as_asgi()),
    path('status/', StatusConsumer.as_asgi()),
]
