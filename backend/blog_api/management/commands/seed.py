from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from blog_api.models import AboutMe, Category, Post, Project
from django.core.files import File

class Command(BaseCommand):
    help = 'Seeds default data for Mert Karabulut Personal Blog Website'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database default records...')
        
        # 1. Seed Admin User (admin / admin123)
        admin_username = 'admin'
        admin_email = 'admin@mertkarabulut.com'
        admin_pass = 'admin123'
        
        if not User.objects.filter(username=admin_username).exists():
            self.stdout.write(f'Creating default admin account ({admin_username} / {admin_pass})...')
            User.objects.create_superuser(
                username=admin_username, 
                email=admin_email, 
                password=admin_pass
            )
        else:
            self.stdout.write('Admin account already exists.')
            
        # 2. Seed Default About Me for Mert Karabulut
        if AboutMe.objects.count() == 0:
            self.stdout.write('Seeding About Me biography for Mert Karabulut...')
            AboutMe.objects.create(
                name_surname='Mert Karabulut',
                age=21,
                city='İzmir',
                profession='Bilişim Güvenliği Uzmanı & Yazılımcı',
                linkedin_url='https://www.linkedin.com/in/mert-karabulut-3b4227390/',
                github_url='https://github.com/karabulutmert68-konak',
                description=(
                    "Merhaba! Ben Mert Karabulut. İzmir Konak Meslek Yüksekokulu Bilişim Güvenliği Teknolojisi programı "
                    "öğrencisiyim. Siber güvenlik analizi, ağ güvenliği, sızma testleri ve güvenli web uygulaması geliştirme "
                    "alanlarında çalışıyorum. Bu blog web sitesini, üniversite final projem kapsamında hem Angular ve Django "
                    "kullanarak kendimi geliştirmek hem de bilgi güvenliği üzerine hazırladığım teknik notları paylaşmak amacıyla geliştirdim."
                ),
                photo_path='photos/default-avatar.png' # Fallback name
            )
        else:
            self.stdout.write('About Me data already seeded.')
            
        # 3. Seed Default Categories
        if Category.objects.count() == 0:
            self.stdout.write('Seeding default categories...')
            default_categories = [
                {'name': 'Ağ Güvenliği', 'type': 'technical'},
                {'name': 'Web Uygulama Güvenliği', 'type': 'technical'},
                {'name': 'Kişisel Gelişim', 'type': 'non_technical'},
                {'name': 'Siber Tehdit Analizleri', 'type': 'research'},
                {'name': 'Fotoğrafçılık', 'type': 'hobby'},
                {'name': 'Bilim Kurgu', 'type': 'book'}
            ]
            for c in default_categories:
                Category.objects.create(name=c['name'], section_type=c['type'])
                
            # Seed a default blog post
            technical_cat = Category.objects.filter(section_type='technical').first()
            if technical_cat:
                self.stdout.write('Seeding first default blog post...')
                Post.objects.create(
                    category=technical_cat,
                    title='Bilişim Güvenliğinde CIA Triadı ve Önemi',
                    content=(
                        "Web uygulama güvenliğinde en temel kural 'Kullanıcı girdisine asla güvenme!' prensibidir. "
                        "Güvenlik mimarileri, sunucu ile istemci arasındaki veri akışının her aşamasında kontrol "
                        "mekanizmaları işletilerek tasarlanır.\n\n"
                        "Bilgi Güvenliğinin Temel Taşı olan CIA Üçgeni (Gizlilik, Bütünlük, Erişilebilirlik) projemizin "
                        "ve araştırmalarımızın temelini oluşturur:\n\n"
                        "- Gizlilik (Confidentiality): Hassas verilerin yetkisiz erişimlerden korunması.\n"
                        "- Bütünlük (Integrity): Verinin iletim veya saklama sırasında izinsiz değiştirilmemesi.\n"
                        "- Erişilebilirlik (Availability): Sistemlerin siber saldırılar altında dahi hizmet verebilir kalması."
                    ),
                    image_path='posts/default-post.jpg'
                )
        else:
            self.stdout.write('Categories and posts already seeded.')

        # 4. Seed Default GitHub Projects
        if Project.objects.count() == 0:
            self.stdout.write('Seeding default GitHub projects for Mert Karabulut...')
            Project.objects.create(
                title='Siber Güvenlik Tarama Aracı (CyberScanner)',
                description='Python ve Nmap entegrasyonu ile geliştirilmiş, ağ üzerindeki açık portları ve servis zaafiyetlerini tarayarak raporlayan terminal siber güvenlik aracı.',
                github_url='https://github.com/karabulutmert68-konak/cyberscanner',
                language='Python',
                stars=14
            )
            Project.objects.create(
                title='Güvenli Duvar Kağıdı Yönetim Scripti',
                description='Bilişim Güvenliği laboratuvarları için tasarlanmış, ağ üzerindeki istemcilerin güvenli arka plan görsellerini ve kilit ekranı politikalarını otomatize eden Bash otomasyon aracı.',
                github_url='https://github.com/karabulutmert68-konak/lab-wallpaper-policy',
                language='Shell',
                stars=6
            )
            Project.objects.create(
                title='SQL Injection Güvenli Test Laboratuvarı',
                description='Web uygulama güvenliği dersi ödevleri için Django tabanlı, siber güvenlik sızma testleri (Pentest) eğitimi amacıyla kasıtlı olarak zafiyetli kodlanmış güvenli sanal laboratuvar.',
                github_url='https://github.com/karabulutmert68-konak/sqli-vuln-lab',
                language='Python',
                stars=23
            )
        else:
            self.stdout.write('Projects already seeded.')
            
        self.stdout.write(self.style.SUCCESS('Database seeding completed successfully!'))
