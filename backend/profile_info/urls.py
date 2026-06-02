from django.urls import path
from .views import AboutMeView, ProjectListView, UserListView, UserDetailView

app_name = 'profile_info'

urlpatterns = [
    path('aboutme/', AboutMeView.as_view(), name='aboutme'),
    path('projects/', ProjectListView.as_view(), name='projects'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail'),
]
