"""
Management command to seed initial data for the ticketing system.
Run with: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from api.models import Role, Category, User


class Command(BaseCommand):
    help = 'Seeds initial roles, categories and a default admin user into the database'

    def handle(self, *args, **options):
        # Create default roles
        roles_dict = {}
        roles_names = ['USER', 'HELPDESK', 'ADMIN']
        for role_name in roles_names:
            role_obj, created = Role.objects.get_or_create(role_name=role_name)
            roles_dict[role_name] = role_obj
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created role: {role_name}'))
            else:
                self.stdout.write(f'Role already exists: {role_name}')

        # Create default categories
        categories = [
            'Support Technique',
            'Facturation',
            'Compte & Accès',
            'Incident',
            'Demande de fonctionnalité',
            'Autre',
        ]
        for cat_name in categories:
            obj, created = Category.objects.get_or_create(category_name=cat_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created category: {cat_name}'))
            else:
                self.stdout.write(f'Category already exists: {cat_name}')

        # Create default admin user
        admin_username = 'admin'
        admin_email = 'admin@example.com'
        admin_password = 'admin123'
        
        if not User.objects.filter(username=admin_username).exists():
            admin_user = User.objects.create_superuser(
                username=admin_username,
                email=admin_email,
                password=admin_password,
                first_name='System',
                last_name='Admin'
            )
            admin_user.role = roles_dict['ADMIN']
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f'Created admin user: {admin_username} (password: {admin_password})'))
        else:
            admin_user = User.objects.get(username=admin_username)
            admin_user.set_password(admin_password)
            if not admin_user.role:
                admin_user.role = roles_dict['ADMIN']
            admin_user.save()
            self.stdout.write(self.style.SUCCESS(f'Updated existing admin user password and role'))

        self.stdout.write(self.style.SUCCESS('Seeding complete!'))
