from channels.generic.websocket import AsyncJsonWebsocketConsumer
from users.models.users import Users # noqa: F401
from .utils import is_authenticated

class TournamentConsumer(AsyncJsonWebsocketConsumer):
    groups = []

    @is_authenticated
    async def connect(self: AsyncJsonWebsocketConsumer) -> None:
        return await self.accept()

    @is_authenticated
    def receive_json(self: AsyncJsonWebsocketConsumer, content: dict) -> None:
        raise NotImplementedError

    @is_authenticated
    async def disconnect(self: AsyncJsonWebsocketConsumer, code: object) -> object:
        return await self.close()