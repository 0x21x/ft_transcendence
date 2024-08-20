from django.urls import path
from game.consumers.game import GameConsumer # noqa: F401
from game.consumers.game_handler import GameHandlerConsumer # noqa: F401

from users.consumers import StatusConsumer # noqa: F401

websocket_urlpatterns = [
    path('games/', GameHandlerConsumer.as_asgi()),
    path('games/<str:room_name>/', GameConsumer.as_asgi()),
    path('status/', StatusConsumer.as_asgi()),
]
