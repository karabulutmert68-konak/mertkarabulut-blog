from rest_framework import serializers
from .models import Category, ContentItem

class CategorySerializer(serializers.ModelSerializer):
    section_type_display = serializers.CharField(source='get_section_type_display', read_only=True)
    item_count = serializers.IntegerField(source='items.count', read_only=True)
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'section_type', 'section_type_display', 'item_count', 'created_at']
        read_only_fields = ['id', 'slug', 'created_at']

class ContentItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    category_section = serializers.CharField(source='category.section_type', read_only=True)
    class Meta:
        model = ContentItem
        fields = ['id','category','category_name','category_slug','category_section','title','slug','summary','content','image','external_link','status','created_at','updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']
