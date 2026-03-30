from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    RoleViewSet, UserViewSet, CategoryViewSet, 
    TicketViewSet, TicketMessageViewSet, AttachmentViewSet
)
from .auth_views import login_view, register_view, me_view, logout_view, refresh_token_view

router = DefaultRouter()
router.register(r'roles', RoleViewSet)
router.register(r'users', UserViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'tickets', TicketViewSet)
router.register(r'messages', TicketMessageViewSet)
router.register(r'attachments', AttachmentViewSet)

urlpatterns = [
    path('auth/login/', login_view, name='login'),
    path('auth/register/', register_view, name='register'),
    path('auth/me/', me_view, name='me'),
    path('auth/logout/', logout_view, name='logout'),
    path('auth/refresh/', refresh_token_view, name='refresh'),
    path('', include(router.urls)),
]
