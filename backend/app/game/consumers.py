import asyncio
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from users.models import Users # noqa: F401
from .multiplayer import MultiplayerPong, GAME_STATES, ROOM_NAME
from .pong import FPS_SERVER

class GameConsumer(AsyncJsonWebsocketConsumer):
    multiplayer_pong = MultiplayerPong()
    groups = [ROOM_NAME]

    async def connect(self: AsyncJsonWebsocketConsumer) -> None:
        print(self.scope['url_route']['kwargs']['room_name'])
        if not self.scope['user'].is_authenticated:
            await self.close()
        if not self.multiplayer_pong.pong:
            self.multiplayer_pong.init_game()
        self.channel_layer.group_add(ROOM_NAME, self.channel_name)
        await self.accept()
        self.multiplayer_pong.add_player(self.scope['user'].username)

    async def receive_json(self: AsyncJsonWebsocketConsumer, content: dict) -> None:
        if not self.scope['user'].is_authenticated:
            return await self.close()
        if 'action' in content and content['action'] == 'start' and self.multiplayer_pong.pong.game_state != GAME_STATES[1]:
            self.multiplayer_pong.start_game()
            asyncio.create_task(self.game_loop())
        if 'action' in content and content['action'] == 'reset' and self.multiplayer_pong.pong.game_state == GAME_STATES[2]:
            self.multiplayer_pong.init_game()
        if self.multiplayer_pong.pong.game_state != GAME_STATES[1]:
            return
        if 'direction' in content and (content['direction'] == 'left' or content['direction'] == 'right'):
            self.multiplayer_pong.move_paddle(self.scope['user'].username, content['direction'])

    async def game_loop(self: AsyncJsonWebsocketConsumer) -> None:
        while self.multiplayer_pong.pong.game_state == GAME_STATES[1]:
            await self.channel_layer.group_send(ROOM_NAME, {
                'type': 'game_state',
                'pong': self.multiplayer_pong.pong.__dict__()
            })
            self.multiplayer_pong.pong.play_game()
            if self.multiplayer_pong.pong.game_state == GAME_STATES[2]:
                await self.channel_layer.group_send(ROOM_NAME, {
                    'type': 'game_state',
                    'pong': self.multiplayer_pong.pong.__dict__(),
                    'message': 'Game finished.'
                })
                await self.multiplayer_pong.save_scores()
                break
            await asyncio.sleep(FPS_SERVER)

    async def game_state(self: AsyncJsonWebsocketConsumer, event: dict) -> None:
        await self.send_json(event)

    async def disconnect(self: AsyncJsonWebsocketConsumer, code: None) -> None:
        if not self.scope['user'].is_authenticated:
            return await self.close()
        if self.multiplayer_pong.pong.game_state == GAME_STATES[1]:
            self.multiplayer_pong.pong.game_state = GAME_STATES[2]
            self.channel_layer.group_send(ROOM_NAME, {
                'type': 'game_state',
                'message': 'Game finished before it was completed.'
            })
        self.channel_layer.group_discard(ROOM_NAME, self.channel_name)
        self.multiplayer_pong.remove_player(self.scope['user'].username)
        return await self.close()
