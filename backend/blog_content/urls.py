from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ContentItemViewSet

app_name = 'blog_content'

router = DefaultRouter()
router.register('categories', CategoryViewSet, basename='category')
router.register('items', ContentItemViewSet, basename='contentitem')

urlpatterns = [
    path('', include(router.urls)),
]
