import asyncio
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from users.models import Users # noqa: F401
from .game import GameConsumer
from .utils import is_authenticated


class GameHandlerConsumer(AsyncJsonWebsocketConsumer):

    @is_authenticated
    async def connect(self: AsyncJsonWebsocketConsumer) -> None:
        await self.accept()
        asyncio.create_task(self.stream_games_infos())

    async def stream_games_infos(self: AsyncJsonWebsocketConsumer) -> None:
        games = []
        while True:
            new_games = await GameConsumer.get_games()
            if games != new_games:
                games = new_games
                await self.send_json({'games': games or []})
            await asyncio.sleep(0.5)

    async def disconnect(self: AsyncJsonWebsocketConsumer, code: object) -> object:
        return await self.close()