import json
from channels.generic.websocket import AsyncWebsocketConsumer

class TicketConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.ticket_id = self.scope['url_route']['kwargs']['ticket_id']
        self.room_group_name = f'ticket_{self.ticket_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def ticket_message(self, event):
        message = event['message']
        sender = event['sender']
        timestamp = event['timestamp']

        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender,
            'timestamp': timestamp
        }))
