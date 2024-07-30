from channels.generic.websocket import AsyncJsonWebsocketConsumer


class GameConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self: AsyncJsonWebsocketConsumer) -> None:
        if self.scope['user'].is_anonymous:
            await self.close()
        await self.accept()

    async def disconnect(self: AsyncJsonWebsocketConsumer) -> None:
        return await super().close()
