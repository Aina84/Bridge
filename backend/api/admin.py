from django.contrib import admin
from .models import Role, User, Category, Ticket, TicketMessage, Attachment

admin.site.register(Role)
admin.site.register(User)
admin.site.register(Category)
admin.site.register(Ticket)
admin.site.register(TicketMessage)
admin.site.register(Attachment)
