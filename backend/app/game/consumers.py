import asyncio
from typing import Callable, Optional, Any
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async
from users.models import Users # noqa: F401
from .multiplayer import MultiplayerPong, GAME_STATES, GameNotFound
from .models import Game
from .pong import FPS_SERVER

def is_authenticated(func: Callable) -> Callable:
    def wrapper(*args: Optional[Any], **kwargs: Optional[Any]) -> object:  # noqa: ANN401
        if args[0].scope['user'] and not args[0].scope['user'].is_authenticated:
            return args[0].close()
        return func(*args, **kwargs)

    return wrapper

class GameConsumer(AsyncJsonWebsocketConsumer):
    groups = []
    multiplayer_pong = MultiplayerPong()

    @is_authenticated
    async def connect(self: AsyncJsonWebsocketConsumer) -> None:
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = "game_%s" % self.room_name
        if not await self.get_game(self.room_name):
            return await self.close()
        self.channel_layer.group_add(self.room_group_name, self.channel_name)
        self.multiplayer_pong.add_player(self.room_name, self.scope['user'].username)
        return await self.accept()

    @is_authenticated
    async def receive_json(self: AsyncJsonWebsocketConsumer, content: dict) -> None:
        try:
            if 'action' in content and content['action'] == 'start' and self.multiplayer_pong.get_game_status(
                    self.room_name) == GAME_STATES[0]:
                self.multiplayer_pong.start_game(self.room_name)
                asyncio.create_task(self.game_loop())
            elif 'direction' in content and (content['direction'] == 'left' or content['direction'] == 'right'):
                self.multiplayer_pong.move_paddle(self.room_name, self.scope['user'].username, content['direction'])
        except GameNotFound:
            return await self.close_all_connections()

    async def game_loop(self: AsyncJsonWebsocketConsumer) -> None:
        try:
            while self.multiplayer_pong.get_game_status(self.room_name) == GAME_STATES[1]:
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'game.state',
                    'pong': self.multiplayer_pong.get_game_state(self.room_name),
                })
                self.multiplayer_pong.play_game(self.room_name)
                if self.multiplayer_pong.get_game_status(self.room_name) == GAME_STATES[2]:
                    await self.multiplayer_pong.save_scores(self.room_name, delete_after_save=True)
                    return await self.close_all_connections()
                await asyncio.sleep(FPS_SERVER)
        except GameNotFound:
            return await self.close_all_connections()

    async def game_state(self: AsyncJsonWebsocketConsumer, event: dict) -> None:
        await self.send_json(event)

    async def close_all_connections(self: AsyncJsonWebsocketConsumer) -> None:
        if self.room_group_name in self.groups:
            self.groups.remove(self.room_group_name)
        return await self.channel_layer.group_send(self.room_group_name, {'type': 'disconnect'})

    @database_sync_to_async
    def get_game(self: AsyncJsonWebsocketConsumer, game_name: str) -> Game:
        if not Game.objects.filter(name=game_name, status='waiting').first():
            raise GameNotFound()
        return Game.objects.filter(name=game_name, status='waiting').first()

    @is_authenticated
    async def disconnect(self: AsyncJsonWebsocketConsumer, code: None) -> None:
        try:
            self.get_game(self.room_name)
            if self.multiplayer_pong.get_game_status(self.room_name) == GAME_STATES[1]:
                self.multiplayer_pong.set_game_status(self.room_name, GAME_STATES[2])
                await self.multiplayer_pong.save_scores(self.room_name)
                self.channel_layer.group_send(self.room_group_name, {
                    'type': 'game_state',
                    'finished': True,
                })
            self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            self.multiplayer_pong.remove_player(self.room_name, self.scope['user'].username)
        except GameNotFound:
            return await self.close()
        finally:
            return await self.close()

    @classmethod
    async def get_games(cls: type) -> list:
        return await cls.multiplayer_pong.get_infos()

    @classmethod
    def add_room_to_groups(cls: type, room_group_name: str) -> None:
        if not room_group_name in cls.groups:
            cls.groups.append(room_group_name)


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
