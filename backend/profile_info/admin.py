from django.contrib import admin
from .models import AboutMe, Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['name', 'language', 'stars', 'order', 'is_active', 'updated_at']
    list_editable = ['order', 'is_active']
    list_filter = ['language', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['order', 'name']


@admin.register(AboutMe)
class AboutMeAdmin(admin.ModelAdmin):
    list_display = ['name_surname', 'profession', 'city', 'updated_at']
