from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg
from .models import Review, Product

@receiver([post_save, post_delete], sender=Review)
def update_product_rating(sender, instance, **kwargs):
    """Update product rating and review count when a review is created, updated, or deleted"""
    product = instance.product
    
    # Calculate new average rating
    reviews = Review.objects.filter(product=product)
    avg_rating = reviews.aggregate(Avg('rating'))['rating__avg']
    
    # Update product rating and review count
    product.rating = avg_rating if avg_rating is not None else 0.00
    product.num_reviews = reviews.count()
    product.save(update_fields=['rating', 'num_reviews']) 