import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from blog_content.models import Category, ContentItem

def populate():
    # 1. Kategorileri oluştur/getir
    cat_tech, _ = Category.objects.get_or_create(
        name="Siber Güvenlik & Ağ",
        section_type="technical"
    )
    cat_dev, _ = Category.objects.get_or_create(
        name="Yazılım Geliştirme",
        section_type="technical"
    )
    
    cat_psych, _ = Category.objects.get_or_create(
        name="Liderlik & Motivasyon",
        section_type="non_technical"
    )
    
    cat_scuba, _ = Category.objects.get_or_create(
        name="Tüplü Dalış (Scuba)",
        section_type="hobby"
    )
    cat_photo, _ = Category.objects.get_or_create(
        name="Mobil Fotoğrafçılık",
        section_type="hobby"
    )
    
    cat_book_tech, _ = Category.objects.get_or_create(
        name="Teknik Kitaplar",
        section_type="book"
    )
    cat_book_fict, _ = Category.objects.get_or_create(
        name="Bilim Kurgu & Roman",
        section_type="book"
    )

    # 2. İçerikleri ekle (Teknik)
    ContentItem.objects.get_or_create(
        title="Zero-Trust Architecture Temelleri",
        category=cat_tech,
        defaults={
            "summary": "Sıfır güven yaklaşımı ile kurumsal ağ güvenliği oluşturma rehberi.",
            "content": "Zero-trust modelinin temel mantığı 'asla güvenme, her zaman doğrula' üzerine kuruludur. Bu yazıda ağ bölümlendirme ve kimlik erişim yönetiminin (IAM) inceliklerine değiniyoruz..."
        }
    )
    ContentItem.objects.get_or_create(
        title="Python ile Sızma Testi Otomasyonu",
        category=cat_dev,
        defaults={
            "summary": "Kendi araçlarımızı yazarak tekrarlanan sızma testi görevlerini otomatikleştirme.",
            "content": "Python'un güçlü kütüphaneleri (requests, scapy, socket) sayesinde ağ taramalarını ve payload gönderimlerini kendi yazdığımız scriptler üzerinden yönetebiliriz."
        }
    )

    # 3. İçerikler (Teknik Olmayan)
    ContentItem.objects.get_or_create(
        title="Kriz Anında Liderlik: Sakin Kalma Sanatı",
        category=cat_psych,
        defaults={
            "summary": "Özellikle siber saldırı gibi kaos anlarında ekibi doğru yönetebilmenin sırları.",
            "content": "Stres altında karar verebilme yetisi hem bilişim hem de kişisel hayatta bizi öne çıkaran en önemli becerilerden biridir. Bir olay müdahalesi (Incident Response) sırasında duygusal zekanın (EQ) ne kadar hayati olduğunu inceleyelim."
        }
    )

    # 4. İçerikler (Hobiler)
    ContentItem.objects.get_or_create(
        title="Kaş'ta İlk Gece Dalışı Deneyimi",
        category=cat_scuba,
        defaults={
            "summary": "Karanlık sularda yepyeni bir dünya ile tanışmak.",
            "content": "Su altının o sessizliği ve gece fener ışığıyla beliren canlılar... Dalışın bana kattığı en büyük his, su altında tamamen anda kalabilmektir."
        }
    )
    ContentItem.objects.get_or_create(
        title="Şehrin Işıkları: Gece Çekimi İpuçları",
        category=cat_photo,
        defaults={
            "summary": "Sadece bir akıllı telefon kamerası ile profesyonel hissettiren fotoğraflar yakalamak.",
            "content": "Doğru pozlama, ışık patlamalarının önüne geçme ve kompozisyon kuralları ile cebimizdeki telefonu bir aynasız kamera gibi kullanmak aslında çok kolay."
        }
    )

    # 5. İçerikler (Kitaplar - En az 3 adet)
    ContentItem.objects.get_or_create(
        title="The Web Application Hacker's Handbook",
        category=cat_book_tech,
        defaults={
            "summary": "Dafydd Stuttard & Marcus Pinto. Web uygulama güvenliği alanının başucu kitabı.",
            "content": "Web zafiyetlerini, oturum yönetimini, veri tabanı açıklarını ve bunların nasıl istismar edilip kapatılacağını anlatan efsanevi eser. Benim siber güvenlik yolculuğumda temel taşlardan biridir."
        }
    )
    ContentItem.objects.get_or_create(
        title="1984",
        category=cat_book_fict,
        defaults={
            "summary": "George Orwell. Distopik kurgunun ve mahremiyetin sorgulanmasının başyapıtı.",
            "content": "Büyük Birader'in gözetimi altındaki dünyayı okurken, günümüz dijital çağındaki veri güvenliği ve kişisel mahremiyet ihlalleri konularında tüyler ürperten paralellikler kurmamak imkansız."
        }
    )
    ContentItem.objects.get_or_create(
        title="Ghost in the Wires",
        category=cat_book_tech,
        defaults={
            "summary": "Kevin Mitnick. Dünyanın en ünlü hacker'ının kendi ağzından anıları.",
            "content": "Sosyal mühendisliğin sadece teknik bir olay olmadığını, insan psikolojisinin en büyük zafiyet olduğunu harika hikayelerle, polisiye roman tadında anlatan harika bir kitap."
        }
    )

    print("Veritabanına örnek içerikler başarıyla eklendi!")

if __name__ == '__main__':
    populate()
