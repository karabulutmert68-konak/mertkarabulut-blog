from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate



from .models import AboutMe, Category, Post, Project
from .serializers import AboutMeSerializer, CategorySerializer, PostSerializer, ProjectSerializer

# Helper to enforce Admin-only permissions on write actions
class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


# 1. Custom Admin Login API
class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {'error': 'Kullanıcı adı ve şifre gereklidir!'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        user = authenticate(username=username, password=password)
        if user is not None:
            if not user.is_staff:
                return Response(
                    {'error': 'Yalnızca yönetici (staff) yetkisine sahip kullanıcılar giriş yapabilir!'},
                    status=status.HTTP_403_FORBIDDEN
                )
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': {
                    'username': user.username
                }
            })
        else:
            return Response(
                {'error': 'Hatalı kullanıcı adı veya şifre!'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )


# 2. Hakkımda (About Me) API ViewSet
class AboutMeViewSet(viewsets.ModelViewSet):
    queryset = AboutMe.objects.all()
    serializer_class = AboutMeSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrReadOnly]

    # GET /api/about/
    def list(self, request):
        about = AboutMe.objects.order_by('-id').first()
        if not about:
            return Response({'error': 'Hakkımda bilgisi bulunamadı!'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(about)
        return Response(serializer.data)

    # PUT /api/about/ (custom action to update the singleton about_me row)
    def update(self, request, pk=None):
        about = AboutMe.objects.order_by('-id').first()
        if not about:
            # Create if empty
            serializer = self.get_serializer(data=request.data)
        else:
            serializer = self.get_serializer(about, data=request.data, partial=True)
            
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Hakkımda bilgileri başarıyla güncellendi.',
                'data': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # POST /api/about/photo/ (custom action for image uploads)
    @action(detail=False, methods=['post'], url_path='photo')
    def upload_photo(self, request):
        about = AboutMe.objects.order_by('-id').first()
        if not about:
            about = AboutMe.objects.create(name_surname="Mert Karabulut", age=21, city="İzmir", profession="Bilişim Güvenliği Öğrenci")
            
        photo = request.FILES.get('photo')
        if not photo:
            return Response({'error': 'Lütfen bir resim dosyası seçin!'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Basic Cyber Security Filter (MIME Type check)
        allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        if photo.content_type not in allowed_types:
            return Response(
                {'error': 'Yalnızca resim dosyaları (.jpg, .jpeg, .png, .gif, .webp) yüklenebilir!'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        about.photo_path = photo
        about.save()
        
        serializer = self.get_serializer(about)
        return Response({
            'message': 'Profil fotoğrafı başarıyla güncellendi.',
            'photo_path': serializer.data['photo_path']
        })


# 3. Kategori (Categories) API ViewSet
class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all().order_by('name')
    serializer_class = CategorySerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Category.objects.all().order_by('name')
        section_type = self.request.query_params.get('section_type')
        if section_type:
            queryset = queryset.filter(section_type=section_type)
        return queryset


# 4. Blog Yazıları (Posts) API ViewSet
class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = Post.objects.all().order_by('-created_at')
        section_type = self.request.query_params.get('section_type')
        category_id = self.request.query_params.get('category_id')
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        elif section_type:
            queryset = queryset.filter(category__section_type=section_type)
            
        return queryset

    # Intercept create/update to validate file upload safety
    def create(self, request, *args, **kwargs):
        image = request.FILES.get('image')
        if image:
            allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if image.content_type not in allowed_types:
                return Response(
                    {'error': 'Yalnızca resim dosyaları (.jpg, .jpeg, .png, .gif, .webp) yüklenebilir!'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # DRF expects category_id to map to 'category' foreign key
        data = request.data.copy()
        if 'category_id' in data and 'category' not in data:
            data['category'] = data['category_id']
            
        serializer = self.get_serializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Blog yazısı başarıyla eklendi.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        image = request.FILES.get('image')
        if image:
            allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if image.content_type not in allowed_types:
                return Response(
                    {'error': 'Yalnızca resim dosyaları (.jpg, .jpeg, .png, .gif, .webp) yüklenebilir!'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        data = request.data.copy()
        if 'category_id' in data and 'category' not in data:
            data['category'] = data['category_id']
            
        serializer = self.get_serializer(instance, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Blog yazısı başarıyla güncellendi.',
                'data': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 5. GitHub Projeleri (Projects) API ViewSet
class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all().order_by('-id')
    serializer_class = ProjectSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminOrReadOnly]

    # Intercept create/update to validate file upload safety
    def create(self, request, *args, **kwargs):
        image = request.FILES.get('image')
        if image:
            allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if image.content_type not in allowed_types:
                return Response(
                    {'error': 'Yalnızca resim dosyaları (.jpg, .jpeg, .png, .gif, .webp) yüklenebilir!'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'GitHub projesi başarıyla eklendi.',
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        image = request.FILES.get('image')
        if image:
            allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if image.content_type not in allowed_types:
                return Response(
                    {'error': 'Yalnızca resim dosyaları (.jpg, .jpeg, .png, .gif, .webp) yüklenebilir!'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
                
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'GitHub projesi başarıyla güncellendi.',
                'data': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
