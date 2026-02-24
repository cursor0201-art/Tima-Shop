from django.contrib import admin
from .models import Category, Brand, Product, ProductImage, SKU, CargoSettings, Order, OrderItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'is_active')
    prepopulated_fields = {'slug': ('name',)}

@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class SKUInline(admin.TabularInline):
    model = SKU
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'brand', 'public_price', 'china_price', 'margin', 'is_active')
    list_filter = ('category', 'brand', 'is_active')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, SKUInline]
    readonly_fields = ('margin',)

@admin.register(CargoSettings)
class CargoSettingsAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'pricing_mode', 'updated_at')

    def has_add_permission(self, request):
        if self.model.objects.count() >= 1:
            return False
        return super().has_add_permission(request)

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name_snapshot', 'sku_snapshot', 'unit_price_snapshot', 'line_total')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'customer_name', 'status', 'total', 'created_at')
    list_filter = ('status', 'delivery_method', 'payment_method')
    search_fields = ('order_number', 'customer_name', 'customer_phone')
    readonly_fields = ('order_number', 'public_token', 'subtotal', 'shipping_fee', 'total', 'created_at')
    inlines = [OrderItemInline]
