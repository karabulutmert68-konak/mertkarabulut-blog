import uuid
from django.db import models
from django.utils.text import slugify

class Category(models.Model):
    SECTION_CHOICES = [
        ('technical', 'Teknik Bilgi'),
        ('non_technical', 'Teknik Olmayan Bilgi'),
        ('research', 'Araştırmalarım'),
        ('hobby', 'Hobilerim'),
        ('book', 'Okuduğum Kitaplar'),
    ]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, verbose_name="Kategori Adı")
    slug = models.SlugField(max_length=100, unique=True, verbose_name="Slug", blank=True)
    section_type = models.CharField(max_length=50, choices=SECTION_CHOICES, verbose_name="Bölüm Tipi")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")

    class Meta:
        verbose_name = "Kategori"
        verbose_name_plural = "Kategoriler"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            temp = self.name.replace('ı','i').replace('ö','o').replace('ü','u').replace('ş','s').replace('ç','c').replace('ğ','g')
            self.slug = slugify(temp)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_section_type_display()} - {self.name}"


class ContentItem(models.Model):
    STATUS_CHOICES = [('draft', 'Taslak'), ('published', 'Yayınlandı')]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name="items", verbose_name="Kategori")
    title = models.CharField(max_length=200, verbose_name="Başlık")
    slug = models.SlugField(max_length=200, unique=True, verbose_name="Slug", blank=True)
    summary = models.TextField(verbose_name="Özet Açıklama", blank=True)
    content = models.TextField(verbose_name="İçerik")
    image = models.ImageField(upload_to="content_photos/", verbose_name="Görsel", blank=True, null=True)
    external_link = models.URLField(max_length=255, verbose_name="Dış Bağlantı", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='published', verbose_name="Durum")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Güncellenme Tarihi")

    class Meta:
        verbose_name = "İçerik Öğesi"
        verbose_name_plural = "İçerik Öğeleri"
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            temp = self.title.replace('ı','i').replace('ö','o').replace('ü','u').replace('ş','s').replace('ç','c').replace('ğ','g')
            self.slug = slugify(temp)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
