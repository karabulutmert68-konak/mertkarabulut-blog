from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from .models import AboutMe, Project
from .serializers import AboutMeSerializer, ProjectSerializer
from drf_spectacular.utils import extend_schema


class ProjectListView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="list_projects",
        summary="Proje listesini getir",
        responses={200: ProjectSerializer(many=True)}
    )
    def get(self, request):
        projects = Project.objects.filter(is_active=True)
        return Response(ProjectSerializer(projects, many=True).data)


class AboutMeView(APIView):
    permission_classes = [AllowAny]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        # Veritabanında en son güncellenen AboutMe kaydını döndür.
        # Eğer hiç kayıt yoksa varsayılan değerlerle yeni bir tane oluştur.
        obj = AboutMe.objects.order_by('-updated_at').first()
        if obj is None:
            obj = AboutMe.objects.create(
                name_surname="Mert KARABULUT",
                age=20,
                city="İzmir",
                profession="Siber Güvenlik Uzmanı & Full-Stack Geliştirici",
                school="Konak Kavram Meslek Yüksekokulu - Siber Güvenlik Teknolojileri",
                linkedin_url="https://www.linkedin.com/in/mert-karabulut-3b4227390/",
                github_url="https://github.com/karabulutmert68-konak",
                bio_paragraph="Konak Kavram Meslek Yüksekokulu'nda Siber Güvenlik Teknolojileri öğrencisiyim. Siber güvenlik analitiği, sızma testleri ve güvenli yazılım geliştirme metodolojileri ile ilgileniyorum. Bu kişisel web sitesinde, hem teknik hem de teknik olmayan konulardaki bilgi ve birikimlerimi paylaşıyorum."
            )
        return obj

    @extend_schema(
        operation_id="get_about_me",
        summary="Hakkımda bilgilerini getir",
        description="Veritabanındaki tekil Hakkımda (About Me) kaydını döner. Eğer henüz kayıt yoksa varsayılan değerlerle oluşturur.",
        responses={200: AboutMeSerializer}
    )
    def get(self, request):
        obj = self.get_object()
        serializer = AboutMeSerializer(obj, context={'request': request})
        return Response(serializer.data)

    @extend_schema(
        operation_id="update_about_me",
        summary="Hakkımda bilgilerini güncelle",
        request=AboutMeSerializer,
        responses={200: AboutMeSerializer}
    )
    def put(self, request):
        obj = self.get_object()
        serializer = AboutMeSerializer(obj, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth import get_user_model
from .serializers import RegisterSerializer, UserSerializer, AdminCreateUserSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(operation_id="get_current_user", summary="Mevcut kullanıcıyı getir", responses={200: UserSerializer})
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class UserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by('id')
        return Response(UserSerializer(users, many=True).data)

    def post(self, request):
        serializer = AdminCreateUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def patch(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'detail': 'Bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({'detail': 'Bulunamadı.'}, status=status.HTTP_404_NOT_FOUND)
        if user == request.user:
            return Response({'detail': 'Kendinizi silemezsiniz.'}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
