from rest_framework import viewsets
from .models import Role, User, Category, Ticket, TicketMessage, Attachment
from .serializers import (
    RoleSerializer, UserSerializer, CategorySerializer, 
    TicketSerializer, TicketMessageSerializer, AttachmentSerializer
)
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import json


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
import json


class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.all()
    serializer_class = TicketSerializer

    def perform_create(self, serializer):
        ticket = serializer.save(created_by=self.request.user)
        for file in self.request.FILES.getlist('attachments'):
            Attachment.objects.create(ticket=ticket, file=file)

    @action(detail=True, methods=['post'])
    def messages(self, request, pk=None):
        ticket = self.get_object()
        content = request.data.get('content')
        attachments = request.FILES.getlist('attachments')
        
        if not content and not attachments:
            return Response({'detail': 'Content or attachments are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        message = TicketMessage.objects.create(
            ticket=ticket,
            message=content,
            created_by=request.user
        )
        
        for file in request.FILES.getlist('attachments'):
            Attachment.objects.create(ticket=ticket, message=message, file=file)
            
        serializer = TicketMessageSerializer(message)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class TicketMessageViewSet(viewsets.ModelViewSet):
    queryset = TicketMessage.objects.all()
    serializer_class = TicketMessageSerializer

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
