from rest_framework import generics, viewsets, status, pagination
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from django.db import transaction
from django.shortcuts import get_object_or_404
from decimal import Decimal

from .models import Category, Brand, Product, SKU, CargoSettings, Order, OrderItem, PaymeTransaction, PaymentReceipt
from .utils import send_telegram_notification
from .serializers import (
    CategorySerializer, BrandSerializer, ProductPublicSerializer, 
    ProductAdminSerializer, CargoSettingsSerializer, 
    OrderWriteSerializer, OrderReadSerializer, PaymentReceiptSerializer
)
import os
import base64
from django.utils import timezone
from .utils import send_telegram_notification
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.authentication import BasicAuthentication

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductPublicSerializer
    permission_classes = [AllowAny]
    pagination_class = pagination.PageNumberPagination

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

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

# Legacy views for backward compatibility
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
        order.status = Order.Status.AWAITING_PAYMENT
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

class PaymentInstructionsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response({
            "card_number": settings.PAYMENT_CARD_NUMBER,
            "card_holder": settings.PAYMENT_CARD_HOLDER,
            "instructions": settings.PAYMENT_INSTRUCTIONS,
        })

class SubmitReceiptView(APIView):
    permission_classes = [AllowAny]
    parser_classes = (pagination.parsers.MultiPartParser, pagination.parsers.FormParser) if hasattr(pagination, 'parsers') else []

    def post(self, request, public_token):
        order = get_object_or_404(Order, public_token=public_token)
        
        if order.status == Order.Status.PAID:
            return Response({"detail": "Order is already paid."}, status=status.HTTP_400_BAD_REQUEST)
            
        file_obj = request.FILES.get('receipt_image')
        if not file_obj:
            return Response({"detail": "No receipt image provided."}, status=status.HTTP_400_BAD_REQUEST)
            
        # Basic validation
        if not file_obj.name.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
            return Response({"detail": "Invalid file type. Please upload an image."}, status=status.HTTP_400_BAD_REQUEST)
            
        receipt, created = PaymentReceipt.objects.update_or_create(
            order=order,
            defaults={
                'receipt_image': file_obj,
                'note': request.data.get('note', '')
            }
        )
        
        order.status = Order.Status.RECEIPT_SUBMITTED
        order.save()
        
        # Trigger Telegram notification with receipt
        try:
            send_telegram_notification(order, receipt=receipt)
        except Exception as e:
            print(f"Telegram notification fail: {e}")
            
        return Response({"detail": "Receipt submitted successfully. We will verify your payment."}, status=status.HTTP_200_OK)

class PaymeUrlView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, public_token):
        order = get_object_or_404(Order, public_token=public_token)
        
        merchant_id = os.environ.get('PAYME_MERCHANT_ID', 'YOUR_MERCHANT_ID')
        amount = int(order.total * 100)  # to tiyin
        return_url = os.environ.get('PAYME_RETURN_URL', 'http://localhost:5173/order-success')
        
        # ac.order_id=ORDER_NUMBER;m=MERCHANT_ID;a=AMOUNT_TIYIN;c=RETURN_URL
        params = f"m={merchant_id};ac.order_id={order.order_number};a={amount};c={return_url}"
        encoded_params = base64.b64encode(params.encode()).decode()
        
        payme_url = f"https://checkout.paycom.uz/{encoded_params}"
        if os.environ.get('PAYME_IS_TEST') == 'True':
            payme_url = f"https://test.paycom.uz/{encoded_params}"
            
        return Response({"url": payme_url})

class PaymeMerchantAuthentication(BasicAuthentication):
    def authenticate(self, request):
        # Payme uses Basic auth: Paycom as user, secret key as password
        return super().authenticate(request)

class PaymeView(APIView):
    permission_classes = [AllowAny] # Authentication is handled inside for specific logic if needed, but normally handled by MW or Decorator

    def post(self, request):
        # Basic Auth check (manual for simplicity in this example, or use DRF Auth)
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Basic '):
            return self.error(-32504, "Authentication error")
        
        try:
            encoded_auth = auth_header.split(' ')[1]
            decoded_auth = base64.b64decode(encoded_auth).decode()
            username, password = decoded_auth.split(':')
            if username != 'Paycom' or password != os.environ.get('PAYME_SECRET_KEY'):
                return self.error(-32504, "Authentication error")
        except:
            return self.error(-32504, "Authentication error")

        data = request.data
        method = data.get('method')
        params = data.get('params', {})
        rpc_id = data.get('id')

        if method == 'CheckPerformTransaction':
            return self.check_perform_transaction(params, rpc_id)
        elif method == 'CreateTransaction':
            return self.create_transaction(params, rpc_id)
        elif method == 'PerformTransaction':
            return self.perform_transaction(params, rpc_id)
        elif method == 'CancelTransaction':
            return self.cancel_transaction(params, rpc_id)
        elif method == 'CheckTransaction':
            return self.check_transaction(params, rpc_id)
        elif method == 'GetStatement':
            return self.get_statement(params, rpc_id)
        
        return self.error(-32601, "Method not found", rpc_id)

    def check_perform_transaction(self, params, rpc_id):
        order_number = params.get('account', {}).get('order_id')
        amount = params.get('amount')
        
        order = Order.objects.filter(order_number=order_number).first()
        if not order:
            return self.error(-31050, "Order not found", rpc_id)
        
        if int(order.total * 100) != amount:
            return self.error(-31001, "Incorrect amount", rpc_id)
        
        if order.status == 'PAID':
            return self.error(-31050, "Order already paid", rpc_id)

        return Response({
            "result": {"allow": True},
            "id": rpc_id
        })

    def create_transaction(self, params, rpc_id):
        payme_id = params.get('id')
        order_number = params.get('account', {}).get('order_id')
        amount = params.get('amount')
        payme_time = params.get('time')

        order = Order.objects.filter(order_number=order_number).first()
        if not order:
            return self.error(-31050, "Order not found", rpc_id)

        if int(order.total * 100) != amount:
            return self.error(-31001, "Incorrect amount", rpc_id)

        transaction = PaymeTransaction.objects.filter(order=order).first()
        if transaction:
            if transaction.payme_id != payme_id:
                return self.error(-31050, "Order has another transaction", rpc_id)
            if transaction.state != PaymeTransaction.State.CREATED:
                return self.error(-31050, "Transaction in invalid state", rpc_id)
            
            # Return existing
            return Response({
                "result": {
                    "create_time": int(transaction.created_time.timestamp() * 1000),
                    "transaction": str(transaction.id),
                    "state": transaction.state
                },
                "id": rpc_id
            })

        # Check if transaction with this payme_id exists for another order
        if PaymeTransaction.objects.filter(payme_id=payme_id).exists():
            return self.error(-31050, "Transaction already exists", rpc_id)

        # Create new transaction
        transaction = PaymeTransaction.objects.create(
            order=order,
            payme_id=payme_id,
            amount=Decimal(amount) / 100,
            payme_created_time=payme_time,
            state=PaymeTransaction.State.CREATED
        )
        
        order.status = 'PENDING_PAYMENT'
        order.save()

        return Response({
            "result": {
                "create_time": int(transaction.created_time.timestamp() * 1000),
                "transaction": str(transaction.id),
                "state": transaction.state
            },
            "id": rpc_id
        })

    def perform_transaction(self, params, rpc_id):
        payme_id = params.get('id')
        transaction = PaymeTransaction.objects.filter(payme_id=payme_id).first()
        
        if not transaction:
            return self.error(-31003, "Transaction not found", rpc_id)
        
        if transaction.state == PaymeTransaction.State.PERFORMED:
            return Response({
                "result": {
                    "transaction": str(transaction.id),
                    "perform_time": int(transaction.perform_time.timestamp() * 1000),
                    "state": transaction.state
                },
                "id": rpc_id
            })
        
        if transaction.state != PaymeTransaction.State.CREATED:
            return self.error(-31008, "Invalid state", rpc_id)

        # Perform
        transaction.state = PaymeTransaction.State.PERFORMED
        transaction.perform_time = timezone.now()
        transaction.save()

        order = transaction.order
        order.status = 'PAID'
        order.save()

        # Send Telegram notification
        try:
            send_telegram_notification(order)
        except:
            pass

        return Response({
            "result": {
                "transaction": str(transaction.id),
                "perform_time": int(transaction.perform_time.timestamp() * 1000),
                "state": transaction.state
            },
            "id": rpc_id
        })

    def cancel_transaction(self, params, rpc_id):
        payme_id = params.get('id')
        reason = params.get('reason')
        transaction = PaymeTransaction.objects.filter(payme_id=payme_id).first()

        if not transaction:
            return self.error(-31003, "Transaction not found", rpc_id)

        if transaction.state == PaymeTransaction.State.CANCELLED or transaction.state == PaymeTransaction.State.CANCEL_AFTER_PERFORM:
             return Response({
                "result": {
                    "transaction": str(transaction.id),
                    "cancel_time": int(transaction.cancel_time.timestamp() * 1000),
                    "state": transaction.state
                },
                "id": rpc_id
            })

        if transaction.state == PaymeTransaction.State.CREATED:
            transaction.state = PaymeTransaction.State.CANCELLED
            order_status = 'CANCELED'
        elif transaction.state == PaymeTransaction.State.PERFORMED:
            transaction.state = PaymeTransaction.State.CANCEL_AFTER_PERFORM
            order_status = 'CANCELED' # Or keep as PAID and handle separately, but usually CANCELED
        else:
            return self.error(-31008, "Invalid state", rpc_id)

        transaction.cancel_time = timezone.now()
        transaction.reason = reason
        transaction.save()

        order = transaction.order
        order.status = order_status
        order.save()

        return Response({
            "result": {
                "transaction": str(transaction.id),
                "cancel_time": int(transaction.cancel_time.timestamp() * 1000),
                "state": transaction.state
            },
            "id": rpc_id
        })

    def check_transaction(self, params, rpc_id):
        payme_id = params.get('id')
        transaction = PaymeTransaction.objects.filter(payme_id=payme_id).first()

        if not transaction:
            return self.error(-31003, "Transaction not found", rpc_id)

        return Response({
            "result": {
                "create_time": int(transaction.created_time.timestamp() * 1000) if transaction.created_time else 0,
                "perform_time": int(transaction.perform_time.timestamp() * 1000) if transaction.perform_time else 0,
                "cancel_time": int(transaction.cancel_time.timestamp() * 1000) if transaction.cancel_time else 0,
                "transaction": str(transaction.id),
                "state": transaction.state,
                "reason": transaction.reason
            },
            "id": rpc_id
        })

    def get_statement(self, params, rpc_id):
        # Basic implementation
        start = params.get('from')
        end = params.get('to')
        
        # In a real app, you'd filter transactions by time
        transactions = PaymeTransaction.objects.all()[:50]
        
        result_transactions = []
        for t in transactions:
            result_transactions.append({
                "id": t.payme_id,
                "time": int(t.created_time.timestamp() * 1000),
                "amount": int(t.amount * 100),
                "account": {"order_id": t.order.order_number},
                "create_time": int(t.created_time.timestamp() * 1000),
                "perform_time": int(t.perform_time.timestamp() * 1000) if t.perform_time else 0,
                "cancel_time": int(t.cancel_time.timestamp() * 1000) if t.cancel_time else 0,
                "transaction": str(t.id),
                "state": t.state,
                "reason": t.reason
            })

        return Response({
            "result": {"transactions": result_transactions},
            "id": rpc_id
        })

    def error(self, code, message_en, rpc_id=None):
        return Response({
            "error": {
                "code": code,
                "message": {
                    "ru": message_en, # Simplified
                    "uz": message_en,
                    "en": message_en
                }
            },
            "id": rpc_id
        })

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
