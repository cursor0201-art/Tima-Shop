from rest_framework import serializers
from .models import Category, Brand, Product, ProductImage, SKU, CargoSettings, Order, OrderItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug']

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image_url', 'is_main', 'sort_order']

class SKUSerializer(serializers.ModelSerializer):
    class Meta:
        model = SKU
        fields = ['id', 'size', 'color', 'stock', 'sku_code', 'weight_grams']

class ProductPublicSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variants = SKUSerializer(many=True, read_only=True)
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'category', 'brand',
            'specs', 'public_price', 'old_price', 'is_active', 'created_at',
            'images', 'variants'
        ]

class ProductAdminSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    variants = SKUSerializer(many=True, read_only=True)
    margin = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'category', 'brand',
            'specs', 'public_price', 'china_price', 'margin', 'is_active', 'created_at',
            'images', 'variants'
        ]

class CargoSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CargoSettings
        fields = '__all__'

class OrderItemWriteSerializer(serializers.Serializer):
    sku_id = serializers.IntegerField()
    qty = serializers.IntegerField(min_value=1)

class OrderWriteSerializer(serializers.ModelSerializer):
    items = OrderItemWriteSerializer(many=True, write_only=True)

    class Meta:
        model = Order
        fields = [
            'customer_name', 'customer_phone', 'customer_address', 'customer_comment',
            'delivery_method', 'payment_method', 'items'
        ]

class OrderItemReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product_name_snapshot', 'sku_snapshot', 'unit_price_snapshot', 
            'qty', 'line_total'
        ]

class OrderReadSerializer(serializers.ModelSerializer):
    items = OrderItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'public_token', 'customer_name', 'customer_phone', 
            'customer_address', 'customer_comment', 'delivery_method', 'payment_method', 
            'status', 'subtotal', 'shipping_fee', 'total', 'created_at', 'items'
        ]
