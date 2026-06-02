from django.contrib import admin
from .models import Category, ContentItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'section_type')
    list_filter = ('section_type',)
    search_fields = ('name',)

@admin.register(ContentItem)
class ContentItemAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'status', 'created_at')
    list_filter = ('status', 'category')
    search_fields = ('title', 'summary', 'content')
    list_editable = ('status',)
