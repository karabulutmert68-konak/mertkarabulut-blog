from django.urls import path
from .views import AboutMeView, ProjectListView

app_name = 'profile_info'

urlpatterns = [
    path('aboutme/', AboutMeView.as_view(), name='aboutme'),
    path('projects/', ProjectListView.as_view(), name='projects'),
]
