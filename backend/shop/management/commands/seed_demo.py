import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from shop.models import Category, Brand, Product, ProductImage, SKU

class Command(BaseCommand):
    help = 'Seed the database with a demo dataset.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("Starting database seed..."))
        
        # Categories
        cat_names = ['Clothing', 'Electronics', 'Home & Garden']
        categories = []
        for name in cat_names:
            cat, created = Category.objects.get_or_create(name=name, slug=slugify(name))
            categories.append(cat)
        
        # Brands
        brand_names = ['Gucci', 'Nike', 'Apple']
        brands = []
        for name in brand_names:
            brand, created = Brand.objects.get_or_create(name=name, slug=slugify(name))
            brands.append(brand)
            
        # Products
        colors = ['Red', 'Blue', 'Black', 'White', 'Green']
        sizes = ['S', 'M', 'L', 'XL']
        
        for i in range(1, 21):
            name = f'Demo Product {i}'
            category = random.choice(categories)
            brand = random.choice(brands)
            china_price = Decimal(random.randint(10, 100))
            public_price = china_price * Decimal(random.choice([1.5, 2.0, 3.0]))
            
            product, created = Product.objects.get_or_create(
                slug=slugify(name),
                defaults={
                    'name': name,
                    'description': f'This is a description for {name}.',
                    'category': category,
                    'brand': brand,
                    'public_price': public_price,
                    'china_price': china_price,
                    'specs': {'Material': 'Cotton', 'Weight': '200g'}
                }
            )
            
            if created:
                # Images
                for j in range(random.randint(1, 3)):
                    ProductImage.objects.create(
                        product=product,
                        image_url=f"https://picsum.photos/seed/{product.id}_{j}/800/800",
                        is_main=(j==0),
                        sort_order=j
                    )
                    
                # SKUs
                for j in range(random.randint(3, 6)):
                    SKU.objects.create(
                        product=product,
                        size=random.choice(sizes),
                        color=random.choice(colors),
                        stock=random.randint(0, 100),
                        sku_code=f'SKU-{product.id}-{j}',
                        weight_grams=random.randint(100, 1000)
                    )
                    
        self.stdout.write(self.style.SUCCESS("Demo data populated successfully!"))
