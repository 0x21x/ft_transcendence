from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from game.consumers.utils import is_authenticated
from users.models.users import Users

class StatusConsumer(AsyncWebsocketConsumer):

    @is_authenticated
    async def connect(self: AsyncWebsocketConsumer) -> None:
        await self.set_user_status(self.scope['user'], True)
        await self.accept()

    @is_authenticated
    async def disconnect(self: AsyncWebsocketConsumer, code: any) -> None:
        await self.set_user_status(self.scope['user'], False)
        return await self.close()

    @database_sync_to_async
    def set_user_status(self: AsyncWebsocketConsumer, user: any, status: bool) -> None:
        Users.objects.filter(pk=user.pk).update(is_online=status)