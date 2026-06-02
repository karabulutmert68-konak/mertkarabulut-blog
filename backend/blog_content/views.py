import uuid
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Category, ContentItem
from .serializers import CategorySerializer, ContentItemSerializer
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter

@extend_schema_view(
    list=extend_schema(
        summary="Kategorileri listele",
        description="Tüm kategorileri döner. section_type parametresiyle filtrelenebilir.",
        parameters=[OpenApiParameter("section_type", str, description="Filtrelenecek bölüm tipi")]
    ),
    create=extend_schema(summary="Yeni kategori oluştur"),
    retrieve=extend_schema(summary="Kategori detayı getir"),
    update=extend_schema(summary="Kategoriyi tamamen güncelle"),
    partial_update=extend_schema(summary="Kategoriyi kısmen güncelle"),
    destroy=extend_schema(summary="Kategoriyi sil")
)
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    lookup_field = 'id'

    def get_queryset(self):
        queryset = super().get_queryset()
        section_type = self.request.query_params.get('section_type')
        if section_type:
            queryset = queryset.filter(section_type=section_type)
        return queryset


@extend_schema_view(
    list=extend_schema(
        summary="İçerik öğelerini listele",
        description="Tüm yayınlanmış içerikleri döner.",
        parameters=[
            OpenApiParameter("section_type", str, description="Filtrelenecek bölüm tipi"),
            OpenApiParameter("category_slug", str, description="Filtrelenecek kategori slug'ı")
        ]
    ),
    create=extend_schema(summary="Yeni içerik öğesi oluştur"),
    retrieve=extend_schema(summary="İçerik öğesi detayı getir"),
    update=extend_schema(summary="İçeriği tamamen güncelle"),
    partial_update=extend_schema(summary="İçeriği kısmen güncelle"),
    destroy=extend_schema(summary="İçeriği sil")
)
class ContentItemViewSet(viewsets.ModelViewSet):
    queryset = ContentItem.objects.all()
    serializer_class = ContentItemSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    lookup_field = 'pk'

    def get_queryset(self):
        queryset = super().get_queryset()

        section_type = self.request.query_params.get('section_type')
        if section_type:
            queryset = queryset.filter(category__section_type=section_type)

        category_slug = self.request.query_params.get('category_slug')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        if not self.request.user.is_authenticated:
            queryset = queryset.filter(status='published')

        return queryset

    def retrieve(self, request, *args, **kwargs):
        lookup_value = self.kwargs.get('pk')
        try:
            uuid.UUID(lookup_value)
            return super().retrieve(request, *args, **kwargs)
        except ValueError:
            item = get_object_or_404(ContentItem, slug=lookup_value)
            if item.status == 'draft' and not request.user.is_authenticated:
                return Response({"detail": "Bulunamadı."}, status=status.HTTP_404_NOT_FOUND)
            serializer = self.get_serializer(item)
            return Response(serializer.data)
