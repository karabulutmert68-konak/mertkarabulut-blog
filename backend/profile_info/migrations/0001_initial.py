import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="AboutMe",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name_surname", models.CharField(max_length=100, verbose_name="İsim Soyisim")),
                ("age", models.IntegerField(verbose_name="Yaş")),
                ("city", models.CharField(max_length=100, verbose_name="Yaşadığım Şehir")),
                ("profession", models.CharField(max_length=100, verbose_name="Meslek")),
                ("school", models.CharField(default="Konak Kavram Meslek Yüksekokulu - Siber Güvenlik Teknolojileri", max_length=200, verbose_name="Okul / Üniversite")),
                ("linkedin_url", models.URLField(blank=True, max_length=255, null=True, verbose_name="LinkedIn URL")),
                ("github_url", models.URLField(blank=True, max_length=255, null=True, verbose_name="Github URL")),
                ("bio_paragraph", models.TextField(verbose_name="Uzun Açıklama Paragrafı")),
                ("photo", models.ImageField(blank=True, null=True, upload_to="profile_photos/", verbose_name="Güncel Fotoğraf")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Son Güncelleme")),
            ],
            options={"verbose_name": "Hakkımda", "verbose_name_plural": "Hakkımda"},
        ),
        migrations.CreateModel(
            name="Project",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=100, verbose_name="Proje Adı")),
                ("description", models.TextField(verbose_name="Açıklama")),
                ("language", models.CharField(blank=True, max_length=50, verbose_name="Programlama Dili")),
                ("github_url", models.URLField(blank=True, max_length=255, verbose_name="GitHub URL")),
                ("stars", models.IntegerField(default=0, verbose_name="Yıldız")),
                ("forks", models.IntegerField(default=0, verbose_name="Fork")),
                ("order", models.IntegerField(default=0, verbose_name="Sıra")),
                ("is_active", models.BooleanField(default=True, verbose_name="Aktif")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Güncellenme")),
            ],
            options={"verbose_name": "Proje", "verbose_name_plural": "Projeler", "ordering": ["order", "name"]},
        ),
    ]
