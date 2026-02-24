from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    CategoryListView, BrandListView, ProductPublicListView, ProductPublicDetailView,
    CargoSettingsView, OrderCreateView, OrderPublicDetailView,
    AdminProductViewSet, AdminOrderViewSet, AdminCargoSettingsView
)
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
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

    # Admin Auth
    path('admin/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('admin/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Admin API Cargo Setting
    path('admin/cargo-settings/', AdminCargoSettingsView.as_view(), name='admin-cargo-settings'),
]

urlpatterns += router.urls
