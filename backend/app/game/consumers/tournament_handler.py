from channels.generic.websocket import AsyncJsonWebsocketConsumer
from users.models import Users # noqa: F401
from .utils import is_authenticated


class TournamentHandlerConsumer(AsyncJsonWebsocketConsumer):

    @is_authenticated
    async def connect(self: AsyncJsonWebsocketConsumer) -> None:
        return await self.accept()

    async def stream_tournament_infos(self: AsyncJsonWebsocketConsumer) -> None:
        raise NotImplementedError

    async def disconnect(self: AsyncJsonWebsocketConsumer, code: object) -> object:
        return await self.close()