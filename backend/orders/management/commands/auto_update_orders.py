from django.core.management.base import BaseCommand
from orders.tasks import auto_update_order_status

class Command(BaseCommand):
    help = 'Automatically update order status from pending to delivered after 5 minutes'

    def handle(self, *args, **options):
        self.stdout.write('Starting automatic order status update...')
        
        try:
            result = auto_update_order_status()
            self.stdout.write(
                self.style.SUCCESS(f'Successfully completed: {result}')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error updating orders: {str(e)}')
            )


