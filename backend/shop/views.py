from rest_framework import generics, viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django.db import transaction
from django.shortcuts import get_object_or_404
from decimal import Decimal

from .models import Category, Brand, Product, SKU, CargoSettings, Order, OrderItem
from .utils import send_telegram_notification
from .serializers import (
    CategorySerializer, BrandSerializer, ProductPublicSerializer, 
    ProductAdminSerializer, CargoSettingsSerializer, 
    OrderWriteSerializer, OrderReadSerializer
)

class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class BrandListView(generics.ListAPIView):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    permission_classes = [AllowAny]

class ProductPublicListView(generics.ListAPIView):
    serializer_class = ProductPublicSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True)
        search = self.request.query_params.get('search', None)
        category_slug = self.request.query_params.get('category', None)
        brand_slug = self.request.query_params.get('brand', None)
        
        if search:
            queryset = queryset.filter(name__icontains=search)
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        if brand_slug:
            queryset = queryset.filter(brand__slug=brand_slug)
            
        # Sorting
        sort = self.request.query_params.get('sort', None)
        if sort == 'price_asc':
            queryset = queryset.order_by('public_price')
        elif sort == 'price_desc':
            queryset = queryset.order_by('-public_price')
        elif sort == 'new':
            queryset = queryset.order_by('-created_at')
            
        return queryset

class ProductPublicDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductPublicSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'

class CargoSettingsView(generics.RetrieveAPIView):
    serializer_class = CargoSettingsSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        obj, created = CargoSettings.objects.get_or_create(id=1)
        return obj

class OrderCreateView(generics.CreateAPIView):
    serializer_class = OrderWriteSerializer
    permission_classes = [AllowAny]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        items_data = serializer.validated_data.pop('items')
        
        if not items_data:
            return Response({"detail": "Order must have at least one item."}, status=status.HTTP_400_BAD_REQUEST)
        
        subtotal = Decimal('0')
        total_weight_grams = 0
        order_items = []
        
        # Create Order first
        order = Order.objects.create(**serializer.validated_data)
        
        # Process items
        for item_data in items_data:
            sku = get_object_or_404(SKU, id=item_data['sku_id'])
            qty = item_data['qty']
            
            if sku.stock < qty:
                return Response({"detail": f"Not enough stock for SKU {sku.id}"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Deduct stock
            sku.stock -= qty
            sku.save()
            
            product = sku.product
            line_total = product.public_price * qty
            subtotal += line_total
            if sku.weight_grams:
                total_weight_grams += sku.weight_grams * qty
            
            order_items.append(
                OrderItem(
                    order=order,
                    product=product,
                    sku=sku,
                    product_name_snapshot=product.name,
                    sku_snapshot=f"{sku.size}/{sku.color}",
                    unit_price_snapshot=product.public_price,
                    qty=qty,
                    line_total=line_total
                )
            )
            
        OrderItem.objects.bulk_create(order_items)
        
        # Apply Cargo Settings
        cargo, _ = CargoSettings.objects.get_or_create(id=1)
        shipping_fee = Decimal('0')
        
        if cargo.pricing_mode == CargoSettings.PricingMode.FIXED and cargo.fixed_fee:
            shipping_fee = cargo.fixed_fee
        elif cargo.pricing_mode == CargoSettings.PricingMode.PERCENT and cargo.percent_rate:
            shipping_fee = (subtotal * cargo.percent_rate) / Decimal('100')
        elif cargo.pricing_mode == CargoSettings.PricingMode.BY_WEIGHT and cargo.price_per_kg:
            shipping_fee = (Decimal(total_weight_grams) / Decimal('1000')) * cargo.price_per_kg
            
        order.subtotal = subtotal
        order.shipping_fee = shipping_fee
        order.total = subtotal + shipping_fee
        order.save()

        # Trigger Telegram notification
        try:
            send_telegram_notification(order)
        except Exception as e:
            print(f"Telegram notification fail: {e}")
            
        return Response({
            "order_number": order.order_number,
            "public_token": order.public_token
        }, status=status.HTTP_201_CREATED)

class OrderPublicDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderReadSerializer
    permission_classes = [AllowAny]
    lookup_field = 'public_token'

# ADMIN VIEWS

class AdminProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductAdminSerializer
    permission_classes = [IsAdminUser]
    
class AdminOrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderReadSerializer
    permission_classes = [IsAdminUser]

class AdminCargoSettingsView(generics.RetrieveUpdateAPIView):
    queryset = CargoSettings.objects.all()
    serializer_class = CargoSettingsSerializer
    permission_classes = [IsAdminUser]
    
    def get_object(self):
        obj, _ = CargoSettings.objects.get_or_create(id=1)
        return obj
