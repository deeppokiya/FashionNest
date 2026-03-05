#!/usr/bin/env python3
"""
Script to populate product variants with sample stock data
"""

import os
import sys
import django

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fashionnest.settings')
django.setup()

from products.models import Product, ProductVariant

def populate_variants():
    """Populate product variants with sample stock data"""
    print("🔄 Populating product variants with sample stock data...")
    
    # Sample stock data for different variants
    sample_stock_data = {
        'denim-jeans': [
            {'size': 'S', 'color': 'Blue', 'stock': 25},
            {'size': 'M', 'color': 'Blue', 'stock': 30},
            {'size': 'L', 'color': 'Blue', 'stock': 20},
            {'size': 'XL', 'color': 'Blue', 'stock': 15},
            {'size': 'S', 'color': 'Black', 'stock': 18},
            {'size': 'M', 'color': 'Black', 'stock': 22},
            {'size': 'L', 'color': 'Black', 'stock': 16},
            {'size': 'XL', 'color': 'Black', 'stock': 12},
        ],
        'silk-blouse': [
            {'size': 'XS', 'color': 'White', 'stock': 15},
            {'size': 'S', 'color': 'White', 'stock': 20},
            {'size': 'M', 'color': 'White', 'stock': 25},
            {'size': 'L', 'color': 'White', 'stock': 18},
            {'size': 'XL', 'color': 'White', 'stock': 12},
            {'size': 'XS', 'color': 'Pink', 'stock': 10},
            {'size': 'S', 'color': 'Pink', 'stock': 15},
            {'size': 'M', 'color': 'Pink', 'stock': 18},
            {'size': 'L', 'color': 'Pink', 'stock': 12},
            {'size': 'XL', 'color': 'Pink', 'stock': 8},
        ],
        'running-shoes': [
            {'size': '7', 'color': 'White', 'stock': 20},
            {'size': '8', 'color': 'White', 'stock': 25},
            {'size': '9', 'color': 'White', 'stock': 30},
            {'size': '10', 'color': 'White', 'stock': 22},
            {'size': '11', 'color': 'White', 'stock': 18},
            {'size': '7', 'color': 'Black', 'stock': 15},
            {'size': '8', 'color': 'Black', 'stock': 20},
            {'size': '9', 'color': 'Black', 'stock': 25},
            {'size': '10', 'color': 'Black', 'stock': 18},
            {'size': '11', 'color': 'Black', 'stock': 12},
        ],
        'leather-jacket': [
            {'size': 'S', 'color': 'Brown', 'stock': 12},
            {'size': 'M', 'color': 'Brown', 'stock': 15},
            {'size': 'L', 'color': 'Brown', 'stock': 18},
            {'size': 'XL', 'color': 'Brown', 'stock': 10},
            {'size': 'S', 'color': 'Black', 'stock': 10},
            {'size': 'M', 'color': 'Black', 'stock': 12},
            {'size': 'L', 'color': 'Black', 'stock': 15},
            {'size': 'XL', 'color': 'Black', 'stock': 8},
        ],
        'summer-dress': [
            {'size': 'XS', 'color': 'Floral', 'stock': 8},
            {'size': 'S', 'color': 'Floral', 'stock': 12},
            {'size': 'M', 'color': 'Floral', 'stock': 15},
            {'size': 'L', 'color': 'Floral', 'stock': 10},
            {'size': 'XL', 'color': 'Floral', 'stock': 6},
            {'size': 'XS', 'color': 'Blue', 'stock': 6},
            {'size': 'S', 'color': 'Blue', 'stock': 10},
            {'size': 'M', 'color': 'Blue', 'stock': 12},
            {'size': 'L', 'color': 'Blue', 'stock': 8},
            {'size': 'XL', 'color': 'Blue', 'stock': 4},
        ]
    }
    
    created_count = 0
    updated_count = 0
    
    for product_slug, variants_data in sample_stock_data.items():
        try:
            product = Product.objects.get(slug=product_slug)
            print(f"📦 Processing {product.name}...")
            
            for variant_data in variants_data:
                variant, created = ProductVariant.objects.get_or_create(
                    product=product,
                    size=variant_data['size'],
                    color=variant_data['color'],
                    defaults={'stock_quantity': variant_data['stock']}
                )
                
                if created:
                    created_count += 1
                    print(f"  ✅ Created variant: {variant.size} {variant.color} - Stock: {variant.stock_quantity}")
                else:
                    # Update existing variant with new stock
                    variant.stock_quantity = variant_data['stock']
                    variant.save()
                    updated_count += 1
                    print(f"  🔄 Updated variant: {variant.size} {variant.color} - Stock: {variant.stock_quantity}")
                    
        except Product.DoesNotExist:
            print(f"⚠️ Product with slug '{product_slug}' not found")
    
    print(f"\n🎉 Variant population completed!")
    print(f"   Created: {created_count} variants")
    print(f"   Updated: {updated_count} variants")
    print(f"   Total: {created_count + updated_count} variants")

if __name__ == "__main__":
    populate_variants()


