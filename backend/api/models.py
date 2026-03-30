from django.db import models
from django.contrib.auth.models import AbstractUser

class Role(models.Model):
    role_id = models.AutoField(primary_key=True)
    role_name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.role_name

class User(AbstractUser):
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)
    
    def __str__(self):
        return self.username

class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.category_name

class Ticket(models.Model):
    STATUS_CHOICES = [
        ('OPEN', 'Open'),
        ('IN_PROGRESS', 'In Progress'),
        ('RESOLVED', 'Resolved'),
        ('CLOSED', 'Closed'),
    ]
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    ]

    ticket_id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='MEDIUM')
    creation_date = models.DateTimeField(auto_now_add=True)
    last_update = models.DateTimeField(auto_now=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tickets')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tickets')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='tickets')

    def __str__(self):
        return f"#{self.ticket_id} - {self.title}"

class TicketMessage(models.Model):
    message_id = models.AutoField(primary_key=True)
    message = models.TextField()
    creation_date = models.DateTimeField(auto_now_add=True)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages')

    def __str__(self):
        return f"Message {self.message_id} on Ticket {self.ticket_id}"

class Attachment(models.Model):
    attachment_id = models.AutoField(primary_key=True)
    file = models.FileField(upload_to='attachments/')
    creation_date = models.DateTimeField(auto_now_add=True)
    
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='attachments')
    message = models.ForeignKey(TicketMessage, on_delete=models.CASCADE, null=True, blank=True, related_name='attachments')

    def __str__(self):
        return f"Attachment {self.attachment_id} for Ticket {self.ticket_id}"
