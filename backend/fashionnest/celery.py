import os
from celery import Celery
from celery.schedules import crontab

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fashionnest.settings')

app = Celery('fashionnest')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'auto-deliver-orders-every-5-minutes': {
        'task': 'orders.tasks.auto_update_order_status',
        'schedule': 300.0,  # every 5 minutes (300 seconds)
    },
    'send-review-reminders-daily': {
        'task': 'orders.tasks.send_review_reminders_batch',
        'schedule': crontab(hour=10, minute=0),  # every day at 10 AM
    },
}

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}') 