from channels.generic.websocket import AsyncJsonWebsocketConsumer
from .utils import is_authenticated

class TournamentConsumer(AsyncJsonWebsocketConsumer):
    groups = []

    @is_authenticated
    async def connect(self: AsyncJsonWebsocketConsumer) -> None:
        return await self.accept()

    @is_authenticated
    def receive_json(self: AsyncJsonWebsocketConsumer, content: dict) -> None:
        raise NotImplementedError

    async def disconnect(self: AsyncJsonWebsocketConsumer, code: object) -> None:
        return await self.close()