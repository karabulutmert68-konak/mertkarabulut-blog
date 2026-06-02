import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, AboutMe, ContentItem } from '../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Hero Section -->
    <div class="hero-wrapper">
      <div class="container hero-container">
        <div class="hero-content">
          <span class="badge badge-primary reveal-on-scroll" style="margin-bottom: 16px;">Siber Güvenlik & Yazılım</span>
          <h1 class="text-gradient reveal-on-scroll" style="font-size: 3.5rem; line-height: 1.1; margin-bottom: 24px;">
            Dijital Savunma Hattı ve <br>
            <span>Derin Odaklanma</span>
          </h1>
          <p class="reveal-on-scroll" style="font-size: 1.15rem; color: var(--text-muted); max-width: 650px; line-height: 1.8; margin-bottom: 40px;">
            Merhaba! Ben {{ aboutMe?.name_surname || 'Mert KARABULUT' }}. Siber Güvenlik Teknolojileri öğrencisiyim.
            Burada, siber güvenlik araştırmalarımı, ağ zafiyet analizlerimi, güvenli kodlama notlarımı ve üretkenlik
            yolculuğumu paylaşıyorum.
          </p>
          <div class="hero-actions reveal-on-scroll" style="display: flex; gap: 16px; flex-wrap: wrap;">
            <a routerLink="/kategori/teknik-bilgi" class="btn btn-primary" style="padding: 16px 32px; font-size: 1.05rem;">Teknik Arşivi Keşfet</a>
            <a routerLink="/hakkimda" class="btn btn-outline" style="padding: 16px 32px; font-size: 1.05rem;">Ben Kimim?</a>
          </div>
        </div>

        <div class="hero-visual reveal-on-scroll">
          <div class="avatar-glow-ring">
            <div class="avatar-fallback-home">
              {{ getInitials(aboutMe?.name_surname || 'Mert KARABULUT') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats / Social Proof -->
    <div class="container reveal-on-scroll" style="margin-top: -30px; margin-bottom: 80px;">
      <div class="stats-row glass-card">
        <div class="stat-item">
          <h3>10+</h3>
          <p>Güvenlik Araştırması</p>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <h3>15+</h3>
          <p>Yazılım Projesi</p>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <h3>250+</h3>
          <p>Pazar Bülteni Okuyucusu</p>
        </div>
      </div>
    </div>

    <!-- "Nasıl Yardımcı Olabilirim?" (How Can I Help You? - Segmented Curation) -->
    <div class="container reveal-on-scroll" style="margin-bottom: 100px;">
      <div style="text-align: center; margin-bottom: 48px;">
        <span class="badge" style="margin-bottom: 12px; border-color: var(--primary);">Kaynak Bölümleri</span>
        <h2 style="font-size: 2.4rem;">Neler Paylaşıyorum?</h2>
        <p style="color: var(--text-muted); max-width: 600px; margin: 0 auto;">
          Aradığınız bilgiye hızlıca ulaşabilmeniz için içerikleri dört ana başlık altında topladım.
        </p>
      </div>

      <div class="grid-2">
        <a routerLink="/kategori/teknik-bilgi" class="glass-card segment-card">
          <div class="segment-icon">🛡️</div>
          <div class="segment-info">
            <h3>Siber Güvenlik & Ağ Analizi</h3>
            <p>Wireshark paket analizleri, zafiyet tespitleri, sızma testleri ve güvenli sistem mimarileri üzerine teknik raporlar.</p>
            <span class="segment-link">Teknik Notları Oku →</span>
          </div>
        </a>

        <a routerLink="/projeler" class="glass-card segment-card">
          <div class="segment-icon">⚙️</div>
          <div class="segment-info">
            <h3>Yazılım & Projeler</h3>
            <p>Python, C#, TypeScript ve Angular kullanarak geliştirdiğim projeler, araçlar ve güvenli yazılım geliştirme prensipleri.</p>
            <span class="segment-link">Projeleri İncele →</span>
          </div>
        </a>

        <a routerLink="/kategori/teknik-olmayan-bilgi" class="glass-card segment-card">
          <div class="segment-icon">🧠</div>
          <div class="segment-info">
            <h3>Kişisel Gelişim & Üretkenlik</h3>
            <p>Zaman yönetimi, Pomodoro ve Zaman Bloklama gibi verimlilik metotları ile derin odaklanma teknikleri üzerine notlarım.</p>
            <span class="segment-link">Yazıları Oku →</span>
          </div>
        </a>

        <a routerLink="/kategori/kitaplar" class="glass-card segment-card">
          <div class="segment-icon">📚</div>
          <div class="segment-info">
            <h3>Kitaplık & İncelemeler</h3>
            <p>Siber güvenlik romanları, teknoloji tarihleri, biyografiler ve vizyon katan genel kültür kitaplarının detaylı özetleri.</p>
            <span class="segment-link">Kitaplığa Göz At →</span>
          </div>
        </a>
      </div>
    </div>

    <!-- Dynamic Latest Content Feed -->
    <div class="container reveal-on-scroll" style="margin-bottom: 100px;">
      <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; flex-wrap: wrap; gap: 16px;">
        <div>
          <span class="badge badge-primary" style="margin-bottom: 12px;">Güncel Kütüphane</span>
          <h2 style="font-size: 2.4rem; margin: 0;">Son Eklenen Notlar</h2>
        </div>
        <a routerLink="/blog" class="btn btn-outline" style="padding: 10px 20px;">Tüm Arşivi Gör →</a>
      </div>

      <div *ngIf="isLoading" class="flex-center" style="padding: 60px 0;">
        <div class="loader"></div>
      </div>

      <div *ngIf="!isLoading">
        <div class="grid-3" *ngIf="latestItems.length > 0; else noItems">
          <div class="glass-card recent-post-card" *ngFor="let item of latestItems">
            <div class="post-meta">
              <span class="badge badge-primary">{{ item.category_name }}</span>
              <span>{{ item.created_at | date:'dd.MM.yyyy' }}</span>
            </div>
            <h3 class="post-title"><a [routerLink]="['/blog', item.slug]">{{ item.title }}</a></h3>
            <p class="post-summary">{{ item.summary | slice:0:120 }}...</p>
            <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.85rem; color: var(--text-dim);">⏱️ 4 dk okuma</span>
              <a [routerLink]="['/blog', item.slug]" style="font-size: 0.9rem; font-weight: 600; color: var(--primary);">Oku →</a>
            </div>
          </div>
        </div>

        <ng-template #noItems>
          <div class="glass-card text-center" style="padding: 60px; color: var(--text-muted);">
            Henüz eklenmiş bir not bulunmamaktadır.
          </div>
        </ng-template>
      </div>
    </div>

    <!-- Ali Abdaal Inspired Newsletter Sunday Food section -->
    <div class="container reveal-on-scroll" style="margin-bottom: 100px;">
      <div class="newsletter-card glass-card">
        <div class="newsletter-info">
          <div class="newsletter-badge">📬 Haftalık Pazar Bülteni</div>
          <h2>Pazar Günü Zihin Gıdası</h2>
          <p>
            Her pazar sabahı, o hafta karşılaştığım en ilginç siber güvenlik araçlarını, ağ güvenliği araştırmalarını
            ve hayatımı kolaylaştıran üretkenlik ipuçlarını içeren kısa bir e-posta bülteni gönderiyorum.
            Hiçbir spam veya reklam yok. Sadece saf bilgi.
          </p>
          <div class="subscriber-count">
            <div class="avatar-stack">
              <span style="background-color: #3178c6">M</span>
              <span style="background-color: #2ea043">K</span>
              <span style="background-color: #f1e05a">S</span>
            </div>
            <span><strong>250+</strong> teknoloji meraklısına katılın</span>
          </div>
        </div>

        <div class="newsletter-form-container">
          <form (submit)="handleSubscribe($event, nameInput.value, emailInput.value)" class="newsletter-form">
            <div class="form-group">
              <label class="form-label" for="sub-name">İsim</label>
              <input
                #nameInput
                type="text"
                id="sub-name"
                class="form-control"
                placeholder="Örn: Mert"
                required>
            </div>
            <div class="form-group">
              <label class="form-label" for="sub-email">E-Posta Adresiniz</label>
              <input
                #emailInput
                type="email"
                id="sub-email"
                class="form-control"
                placeholder="isim@adres.com"
                required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 14px; font-size: 1rem; font-weight: 700; margin-top: 8px;">
              Bültene Abone Ol 🚀
            </button>
            <p style="font-size: 0.75rem; color: var(--text-dim); text-align: center; margin-top: 12px; margin-bottom: 0;">
              Gizliliğinize saygı duyuyorum. İstediğiniz zaman tek tıkla abonelikten çıkabilirsiniz.
            </p>
          </form>
        </div>
      </div>
    </div>

    <!-- Toast Notification Success toast -->
    <div class="toast-notification" [class.show]="showToast">
      <div style="font-size: 1.5rem;">🎉</div>
      <div>
        <h4 style="margin: 0; font-size: 0.95rem; color: #ffffff;">Abonelik Başarılı!</h4>
        <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Pazar Bülteni ailemize katıldığınız için teşekkürler. 📬</p>
      </div>
    </div>
  `,
  styles: [`
    .hero-wrapper {
      padding: 80px 0 120px 0;
      background: radial-gradient(circle at top right, rgba(88, 166, 255, 0.06) 0%, transparent 60%);
      margin-top: -60px;
      border-bottom: 1px solid var(--border-color);
    }

    .hero-container {
      display: grid;
      grid-template-columns: 1.25fr 0.75fr;
      align-items: center;
      gap: 40px;
    }

    .hero-visual {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .avatar-glow-ring {
      position: relative;
      width: 250px;
      height: 250px;
      border-radius: 50%;
      padding: 6px;
      background: linear-gradient(135deg, var(--primary) 0%, transparent 50%, var(--accent) 100%);
      box-shadow: 0 0 40px rgba(88, 166, 255, 0.12);
      animation: rotate-ring 15s linear infinite;
    }

    @keyframes rotate-ring {
      100% { transform: rotate(360deg); }
    }

    .avatar-fallback-home {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: var(--surface-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 4.5rem;
      font-family: var(--font-heading);
      font-weight: 800;
      color: var(--primary);
      transform: rotate(-8deg);
      transition: all 0.3s;
    }

    .avatar-glow-ring:hover .avatar-fallback-home {
      transform: rotate(0deg) scale(1.02);
      color: var(--primary-hover);
    }

    /* Stats Bar */
    .stats-row {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 24px 20px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
    }

    .stat-item {
      text-align: center;
      flex: 1;
    }

    .stat-item h3 {
      font-size: 2.2rem;
      color: var(--primary);
      margin-bottom: 4px;
    }

    .stat-item p {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin: 0;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background-color: var(--border-color);
    }

    /* Segment Curation Cards */
    .segment-card {
      display: flex;
      gap: 24px;
      padding: 32px;
      text-decoration: none !important;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      cursor: pointer;
    }

    .segment-card:hover {
      transform: translateY(-6px);
      border-color: var(--primary);
      box-shadow: 0 12px 40px rgba(88, 166, 255, 0.08);
    }

    .segment-icon {
      font-size: 2.2rem;
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s;
    }

    .segment-card:hover .segment-icon {
      background: rgba(88, 166, 255, 0.1);
      border-color: rgba(88, 166, 255, 0.3);
      transform: scale(1.05);
    }

    .segment-info h3 {
      font-size: 1.3rem;
      margin-bottom: 8px;
      color: #ffffff;
      transition: color 0.2s;
    }

    .segment-card:hover .segment-info h3 {
      color: var(--primary);
    }

    .segment-info p {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 16px;
    }

    .segment-link {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--primary-hover);
    }

    /* Recent post card */
    .recent-post-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 28px;
      transition: all 0.3s ease;
    }

    .recent-post-card:hover {
      transform: translateY(-4px);
      border-color: rgba(88, 166, 255, 0.2);
    }

    .post-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.8rem;
      color: var(--text-dim);
      margin-bottom: 16px;
    }

    .post-title {
      font-size: 1.25rem;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .post-title a {
      color: #ffffff;
    }

    .post-title a:hover {
      color: var(--primary);
    }

    .post-summary {
      font-size: 0.92rem;
      color: var(--text-muted);
      margin-bottom: 24px;
      line-height: 1.6;
    }

    /* Newsletter card */
    .newsletter-card {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 48px;
      padding: 56px;
      background: linear-gradient(135deg, rgba(17, 22, 34, 0.95) 0%, rgba(8, 12, 20, 0.98) 100%);
      border: 1px solid rgba(88, 166, 255, 0.12);
      box-shadow: 0 15px 50px rgba(88, 166, 255, 0.04);
      align-items: center;
    }

    .newsletter-info h2 {
      font-size: 2.2rem;
      margin-bottom: 16px;
    }

    .newsletter-info p {
      color: var(--text-muted);
      font-size: 1.05rem;
      line-height: 1.7;
      margin-bottom: 24px;
    }

    .newsletter-badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      background-color: var(--primary-glow);
      color: var(--primary);
      border: 1px solid rgba(88, 166, 255, 0.15);
      border-radius: 30px;
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 20px;
    }

    .subscriber-count {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.9rem;
      color: var(--text-muted);
    }

    .avatar-stack {
      display: flex;
    }

    .avatar-stack span {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2px solid var(--surface-color);
      font-size: 0.75rem;
      font-weight: 700;
      color: #ffffff;
      margin-right: -8px;
    }

    .newsletter-form-container {
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      padding: 32px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 992px) {
      .hero-container {
        grid-template-columns: 1fr;
        text-align: center;
      }
      .hero-actions {
        justify-content: center;
      }
      .hero-visual {
        order: -1;
      }
      .stats-row {
        flex-direction: column;
        gap: 20px;
      }
      .stat-divider {
        width: 60px;
        height: 1px;
      }
      .newsletter-card {
        grid-template-columns: 1fr;
        padding: 32px;
        gap: 32px;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  public aboutMe: AboutMe | null = null;
  public latestItems: ContentItem[] = [];
  public isLoading = true;
  public showToast = false;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getAboutMe().subscribe({
      next: (data) => this.aboutMe = data,
      error: (err) => console.error("Error fetching about info:", err)
    });

    this.api.getItems('technical').subscribe({
      next: (items) => {
        this.latestItems = items.slice(0, 3);
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error fetching content items:", err);
        this.isLoading = false;
      }
    });
  }

  public getInitials(name: string): string {
    if (!name) return 'MK';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  public handleSubscribe(event: Event, name: string, email: string): void {
    event.preventDefault();
    if (!name.trim() || !email.trim()) return;

    console.log(`Subscribed: ${name} (${email})`);
    this.showToast = true;

    setTimeout(() => {
      this.showToast = false;
    }, 4000);

    const form = event.target as HTMLFormElement;
    form.reset();
  }
}
