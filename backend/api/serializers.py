from rest_framework import serializers
from .models import Role, User, Category, Ticket, TicketMessage, Attachment

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    firstName = serializers.CharField(source='first_name', required=False)
    lastName = serializers.CharField(source='last_name', required=False)
    role = serializers.SlugRelatedField(
        slug_field='role_name',
        queryset=Role.objects.all(),
        required=False,
        allow_null=True
    )
    createdAt = serializers.DateTimeField(source='date_joined', read_only=True)
    updatedAt = serializers.DateTimeField(source='date_joined', read_only=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'firstName', 'lastName', 'role', 'createdAt', 'updatedAt', 'password']
        extra_kwargs = {
            'username': {'required': False},
            'email': {'required': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        if 'username' not in validated_data:
            validated_data['username'] = validated_data['email']
        
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class CategorySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='category_id', read_only=True)
    name = serializers.CharField(source='category_name')

    class Meta:
        model = Category
        fields = ['id', 'name']

class AttachmentSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='attachment_id', read_only=True)
    fileName = serializers.SerializerMethodField()
    fileSize = serializers.SerializerMethodField()
    url = serializers.FileField(source='file', read_only=True)
    createdAt = serializers.DateTimeField(source='creation_date', read_only=True)

    class Meta:
        model = Attachment
        fields = ['id', 'fileName', 'fileSize', 'url', 'createdAt']

    def get_fileName(self, obj):
        import os
        return os.path.basename(obj.file.name)

    def get_fileSize(self, obj):
        try:
            return obj.file.size
        except:
            return 0

class TicketMessageSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='message_id', read_only=True)
    ticketId = serializers.IntegerField(source='ticket.ticket_id', read_only=True)
    author = UserSerializer(source='created_by', read_only=True)
    content = serializers.CharField(source='message')
    createdAt = serializers.DateTimeField(source='creation_date', read_only=True)
    updatedAt = serializers.DateTimeField(source='creation_date', read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = TicketMessage
        fields = ['id', 'ticketId', 'author', 'content', 'createdAt', 'updatedAt', 'attachments']


class TicketSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='ticket_id', read_only=True)
    subject = serializers.CharField(source='title')
    creator = UserSerializer(source='created_by', read_only=True)
    assignedTo = UserSerializer(source='assigned_to', read_only=True, allow_null=True)
    assignedToId = serializers.PrimaryKeyRelatedField(
        source='assigned_to', queryset=User.objects.all(), write_only=True, allow_null=True, required=False
    )
    category = CategorySerializer(read_only=True)
    categoryId = serializers.PrimaryKeyRelatedField(
        source='category', queryset=Category.objects.all(), write_only=True
    )
    messages = TicketMessageSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    createdAt = serializers.DateTimeField(source='creation_date', read_only=True)
    updatedAt = serializers.DateTimeField(source='last_update', read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'subject', 'description', 'status', 'priority',
            'category', 'categoryId',
            'creator', 'assignedTo', 'assignedToId',
            'messages', 'attachments',
            'createdAt', 'updatedAt',
        ]
        read_only_fields = ['category']
        
