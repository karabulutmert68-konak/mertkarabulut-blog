from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AboutMeViewSet, CategoryViewSet, PostViewSet, ProjectViewSet, LoginAPIView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'posts', PostViewSet, basename='posts')
router.register(r'projects', ProjectViewSet, basename='projects')

urlpatterns = [
    # Custom About Me endpoints (singleton-like mapping matching previous REST structure)
    path('about', AboutMeViewSet.as_view({'get': 'list', 'put': 'update'}), name='about-singleton'),
    path('about/photo', AboutMeViewSet.as_view({'post': 'upload_photo'}), name='about-photo'),
    
    # Authentication login
    path('auth/login', LoginAPIView.as_view(), name='admin-login'),
    
    # ViewSets (categories, posts)
    path('', include(router.urls)),
]
