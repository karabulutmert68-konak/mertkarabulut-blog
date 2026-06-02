from rest_framework import serializers
from .models import AboutMe, Category, Post, Project

class AboutMeSerializer(serializers.ModelSerializer):
    class Meta:
        model = AboutMe
        fields = [
            'id', 'name_surname', 'age', 'city', 'profession', 
            'linkedin_url', 'github_url', 'description', 'photo_path', 'updated_at'
        ]

    # Return clean path prefix for photo
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # Ensure we return relative path starting with /uploads/ instead of absolute URL 
        # to match exact frontend behavior and keep it clean
        if instance.photo_path:
            rep['photo_path'] = instance.photo_path.url
        return rep


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'section_type', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    section_type = serializers.CharField(source='category.section_type', read_only=True)

    class Meta:
        model = Post
        fields = [
            'id', 'category_id', 'category', 'category_name', 'section_type', 
            'title', 'content', 'image_path', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'category': {'write_only': True} # For post requests
        }

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.image_path:
            rep['image_path'] = instance.image_path.url
        return rep


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'description', 'github_url', 
            'language', 'stars', 'image', 'created_at', 'updated_at'
        ]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.image:
            rep['image'] = instance.image.url
        return rep
