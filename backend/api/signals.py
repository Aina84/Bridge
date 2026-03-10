from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import TicketMessage
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import json

@receiver(post_save, sender=TicketMessage)
def broadcast_ticket_message(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'ticket_{instance.ticket.ticket_id}',
            {
                'type': 'ticket_message',
                'message': instance.message,
                'sender': instance.created_by.username,
                'timestamp': instance.creation_date.isoformat(),
            }
        )
