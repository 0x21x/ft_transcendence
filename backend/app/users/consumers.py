from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class StatusConsumer(AsyncWebsocketConsumer):
    async def connect(self: AsyncWebsocketConsumer) -> None:
        if not self.scope['user'].is_authenticated:
            return await self.close()
        await self.set_user_status(self.scope['user'], True)
        await self.accept()

    async def disconnect(self: AsyncWebsocketConsumer, code: any) -> None:
        if not self.scope['user'].is_authenticated:
            return await self.close()
        self.scope['user'].is_online = False
        await self.set_user_status(self.scope['user'], False)
        return await super().close()

    @database_sync_to_async
    def set_user_status(self: AsyncWebsocketConsumer, user: any, status: bool) -> None:
        user.is_online = status
        user.save()