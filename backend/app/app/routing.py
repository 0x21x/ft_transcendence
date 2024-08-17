from django.urls import path
from game.consumers import GameConsumer, GameHandlerConsumer # noqa: F401
from users.consumers import StatusConsumer # noqa: F401

websocket_urlpatterns = [
    path('games/', GameHandlerConsumer.as_asgi()),
    path('games/<str:room_name>/', GameConsumer.as_asgi()),
    path('status/', StatusConsumer.as_asgi()),
]
