from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid
import random
import string

class Category(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Brand(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True, null=True)

    def __str__(self):
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    specs = models.JSONField(default=dict, blank=True)
    public_price = models.DecimalField(max_digits=10, decimal_places=2)
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    china_price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def margin(self):
        if self.public_price is not None and self.china_price is not None:
            return self.public_price - self.china_price
        return 0

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image_url = models.URLField(max_length=500)
    is_main = models.BooleanField(default=False)
    sort_order = models.IntegerField(default=0)

    class Meta:
        ordering = ['sort_order']

    def __str__(self):
        return f"Image for {self.product.name}"

class SKU(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=50, blank=True)
    stock = models.IntegerField(default=0)
    sku_code = models.CharField(max_length=100, unique=True)
    weight_grams = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.product.name} - {self.size}/{self.color}"

class CargoSettings(models.Model):
    class PricingMode(models.TextChoices):
        FIXED = 'FIXED', _('Fixed Fee')
        PERCENT = 'PERCENT', _('Percentage of Subtotal')
        BY_WEIGHT = 'BY_WEIGHT', _('By Weight')

    description_ru = models.TextField(blank=True)
    description_uz = models.TextField(blank=True)
    eta_days_min = models.IntegerField(default=0)
    eta_days_max = models.IntegerField(default=0)
    pricing_mode = models.CharField(max_length=20, choices=PricingMode.choices, default=PricingMode.FIXED)
    fixed_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    percent_rate = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    price_per_kg = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Cargo Settings"
        verbose_name_plural = "Cargo Settings"

    def __str__(self):
        return "Global Cargo Settings"

def generate_order_number():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

class Order(models.Model):
    class DeliveryMethod(models.TextChoices):
        PICKUP = 'PICKUP', _('Pickup')
        COURIER = 'COURIER', _('Courier')
        CARGO = 'CARGO', _('Cargo')

    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', _('Cash')
        CARD = 'CARD', _('Card')

    class Status(models.TextChoices):
        NEW = 'NEW', _('New')
        PAID = 'PAID', _('Paid')
        IN_CARGO = 'IN_CARGO', _('In Cargo')
        IN_UZ = 'IN_UZ', _('In Uzbekistan')
        DELIVERED = 'DELIVERED', _('Delivered')
        CANCELED = 'CANCELED', _('Canceled')

    order_number = models.CharField(max_length=20, unique=True, default=generate_order_number)
    public_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    customer_name = models.CharField(max_length=255)
    customer_phone = models.CharField(max_length=50)
    customer_address = models.TextField(blank=True)
    customer_comment = models.TextField(blank=True)
    delivery_method = models.CharField(max_length=20, choices=DeliveryMethod.choices)
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NEW)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.order_number}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    sku = models.ForeignKey(SKU, on_delete=models.SET_NULL, null=True)
    product_name_snapshot = models.CharField(max_length=255)
    sku_snapshot = models.CharField(max_length=100)
    unit_price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    qty = models.IntegerField(default=1)
    line_total = models.DecimalField(max_digits=12, decimal_places=2)

    def __str__(self):
        return f"{self.qty}x {self.product_name_snapshot}"
