from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    CategoryViewSet, ProductViewSet, CategoryListView, BrandListView, ProductPublicListView, ProductPublicDetailView,
    CargoSettingsView, OrderCreateView, OrderPublicDetailView, PaymeUrlView, PaymeView,
    PaymentInstructionsView, SubmitReceiptView,
    AdminProductViewSet, AdminOrderViewSet, AdminCargoSettingsView
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'admin/products', AdminProductViewSet, basename='admin-product')
router.register(r'admin/orders', AdminOrderViewSet, basename='admin-order')

urlpatterns = [
    # Public API
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('brands/', BrandListView.as_view(), name='brand-list'),
    path('products/', ProductPublicListView.as_view(), name='product-list'),
    path('products/<slug:slug>/', ProductPublicDetailView.as_view(), name='product-detail'),
    path('cargo-settings/', CargoSettingsView.as_view(), name='cargo-settings'),
    
    path('orders/', OrderCreateView.as_view(), name='order-create'),
    path('orders/public/<uuid:public_token>/', OrderPublicDetailView.as_view(), name='order-public-detail'),
    path('orders/public/<uuid:public_token>/payme-url/', PaymeUrlView.as_view(), name='payme-url'),
    path('orders/payment-instructions/', PaymentInstructionsView.as_view(), name='payment-instructions'),
    path('orders/public/<uuid:public_token>/submit-receipt/', SubmitReceiptView.as_view(), name='submit-receipt'),
    path('payme/', PaymeView.as_view(), name='payme-merchant-api'),

    # Admin Auth
    path('admin/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('admin/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Admin API Cargo Setting
    path('admin/cargo-settings/', AdminCargoSettingsView.as_view(), name='admin-cargo-settings'),
]

urlpatterns += router.urls