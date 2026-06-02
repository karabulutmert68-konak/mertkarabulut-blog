import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Category",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=100, verbose_name="Kategori Adı")),
                ("slug", models.SlugField(blank=True, max_length=100, unique=True, verbose_name="Slug")),
                ("section_type", models.CharField(
                    choices=[
                        ("technical", "Teknik Bilgi"),
                        ("non_technical", "Teknik Olmayan Bilgi"),
                        ("research", "Araştırmalarım"),
                        ("hobby", "Hobilerim"),
                        ("book", "Okuduğum Kitaplar"),
                    ],
                    max_length=50,
                    verbose_name="Bölüm Tipi",
                )),
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")),
            ],
            options={"verbose_name": "Kategori", "verbose_name_plural": "Kategoriler", "ordering": ["name"]},
        ),
        migrations.CreateModel(
            name="ContentItem",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("title", models.CharField(max_length=200, verbose_name="Başlık")),
                ("slug", models.SlugField(blank=True, max_length=200, unique=True, verbose_name="Slug")),
                ("summary", models.TextField(blank=True, help_text="Kartlarda gösterilecek kısa özet.", verbose_name="Özet Açıklama")),
                ("content", models.TextField(help_text="Markdown veya zengin metin formatında yazılabilir.", verbose_name="İçerik")),
                ("image", models.ImageField(blank=True, null=True, upload_to="content_photos/", verbose_name="Görsel / Fotoğraf")),
                ("external_link", models.URLField(blank=True, help_text="İlgili kitap linki, github reposu veya harici site.", max_length=255, null=True, verbose_name="Dış Bağlantı URL")),
                ("status", models.CharField(choices=[("draft", "Taslak"), ("published", "Yayınlandı")], default="published", max_length=20, verbose_name="Durum")),
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Oluşturulma Tarihi")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Güncellenme Tarihi")),
                ("category", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="items", to="blog_content.category", verbose_name="Kategori")),
            ],
            options={"verbose_name": "İçerik Öğesi", "verbose_name_plural": "İçerik Öğeleri", "ordering": ["-created_at"]},
        ),
    ]
