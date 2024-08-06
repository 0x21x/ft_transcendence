from django.urls import path
from game.consumers import GameConsumer # noqa: F401
from users.consumers import StatusConsumer # noqa: F401

websocket_urlpatterns = [
    path('game/<str:room_name>/', GameConsumer.as_asgi()),
    path('status/', StatusConsumer.as_asgi()),
]
