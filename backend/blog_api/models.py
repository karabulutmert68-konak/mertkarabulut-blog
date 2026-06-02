from django.db import models

class AboutMe(models.Model):
    name_surname = models.CharField(max_length=100, verbose_name="Adı Soyadı")
    age = models.IntegerField(verbose_name="Yaş")
    city = models.CharField(max_length=100, verbose_name="Şehir")
    profession = models.CharField(max_length=100, verbose_name="Meslek")
    linkedin_url = models.URLField(max_length=255, blank=True, null=True, verbose_name="LinkedIn URL")
    github_url = models.URLField(max_length=255, blank=True, null=True, verbose_name="GitHub URL")
    description = models.TextField(verbose_name="Açıklama")
    photo_path = models.ImageField(upload_to='photos/', blank=True, null=True, verbose_name="Profil Fotoğrafı")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Son Güncellenme")

    class Meta:
        db_table = 'about_me'
        verbose_name = 'Hakkımda'
        verbose_name_plural = 'Hakkımda'

    def __str__(self):
        return self.name_surname


class Category(models.Model):
    SECTION_CHOICES = [
        ('technical', 'Teknik Bilgi'),
        ('non_technical', 'Teknik Olmayan Bilgi'),
        ('research', 'Araştırmalarım'),
        ('hobby', 'Hobilerim'),
        ('book', 'Okuduğum Kitaplar'),
    ]

    name = models.CharField(max_length=100, verbose_name="Kategori Adı")
    section_type = models.CharField(
        max_length=20, 
        choices=SECTION_CHOICES, 
        verbose_name="Bölüm Türü"
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")

    class Meta:
        db_table = 'categories'
        verbose_name = 'Kategori'
        verbose_name_plural = 'Kategoriler'

    def __str__(self):
        return f"{self.get_section_type_display()} - {self.name}"


class Post(models.Model):
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE, 
        related_name='posts', 
        verbose_name="Kategori"
    )
    title = models.CharField(max_length=255, verbose_name="Başlık")
    content = models.TextField(verbose_name="İçerik")
    image_path = models.ImageField(upload_to='posts/', blank=True, null=True, verbose_name="Görsel")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme Tarihi")

    class Meta:
        db_table = 'posts'
        verbose_name = 'Blog Yazısı'
        verbose_name_plural = 'Blog Yazıları'

    def __str__(self):
        return self.title


class Project(models.Model):
    title = models.CharField(max_length=150, verbose_name="Proje Adı")
    description = models.TextField(verbose_name="Proje Açıklaması")
    github_url = models.URLField(max_length=255, verbose_name="GitHub URL")
    language = models.CharField(max_length=50, blank=True, null=True, verbose_name="Yazılım Dili")
    stars = models.IntegerField(default=0, verbose_name="Yıldız Sayısı")
    image = models.ImageField(upload_to='projects/', blank=True, null=True, verbose_name="Proje Görseli")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme Tarihi")

    class Meta:
        db_table = 'projects'
        verbose_name = 'GitHub Projesi'
        verbose_name_plural = 'GitHub Projeleri'

    def __str__(self):
        return self.title

