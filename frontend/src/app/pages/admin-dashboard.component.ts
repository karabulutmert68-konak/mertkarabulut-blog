import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';
import { ApiService, AboutMe, Category, ContentItem } from '../services/api.service';

type SectionKey = 'hakkimda' | 'technical' | 'non_technical' | 'research' | 'hobby' | 'book';

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'hakkimda', label: 'Hakkımda' },
  { key: 'technical', label: 'Teknik Bilgi' },
  { key: 'non_technical', label: 'Teknik Olmayan Bilgi' },
  { key: 'research', label: 'Araştırmalarım' },
  { key: 'hobby', label: 'Hobilerim' },
  { key: 'book', label: 'Okuduğum Kitaplar' },
];

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container" style="padding-top: 40px; padding-bottom: 100px;">

      <!-- Header -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:32px; padding-bottom:20px; border-bottom:1px solid var(--border-color);">
        <h1 style="margin:0;"><span style="color:var(--primary);">/</span> Yönetim Paneli</h1>
        <div style="display:flex; align-items:center; gap:16px;">
          <span style="color:var(--secondary); font-size:0.9rem;">{{ user?.username }}</span>
          <a href="https://backend-mertkarabulut.onrender.com/api/docs/" target="_blank" class="btn btn-outline" style="padding:6px 14px; font-size:0.85rem;">Swagger API</a>
          <button class="btn btn-outline" style="border-color:var(--error); color:var(--error);" (click)="logout()">Çıkış</button>
        </div>
      </div>

      <!-- Section Tabs -->
      <div class="section-tabs" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:32px;">
        <button
          *ngFor="let s of sections"
          class="tab-btn"
          [class.active]="activeSection === s.key"
          (click)="switchSection(s.key)">
          {{ s.label }}
        </button>
      </div>

      <!-- Toast -->
      <div class="toast-notification" [class.show]="toast.show" [style.background]="toast.error ? 'rgba(248,81,73,0.15)' : ''">
        <span style="font-size:1.3rem;">{{ toast.error ? '❌' : '✅' }}</span>
        <span style="font-size:0.9rem;">{{ toast.message }}</span>
      </div>

      <!-- ===================== HAKKIMDA SECTION ===================== -->
      <div *ngIf="activeSection === 'hakkimda'">
        <div class="glass-card" style="max-width:800px;">
          <h2 style="color:var(--primary); margin-bottom:24px; font-size:1.4rem;">Hakkımda Bilgilerini Düzenle</h2>

          <!-- Photo -->
          <div style="display:flex; align-items:center; gap:24px; margin-bottom:32px; padding-bottom:24px; border-bottom:1px solid var(--border-color);">
            <div class="photo-preview-wrap">
              <img *ngIf="photoPreview || aboutForm.photo" [src]="photoPreview || aboutForm.photo" alt="Profil" class="photo-preview-img">
              <div *ngIf="!photoPreview && !aboutForm.photo" class="photo-preview-fallback">
                {{ getInitials(aboutForm.name_surname) }}
              </div>
            </div>
            <div>
              <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:12px;">Güncel profil fotoğrafı</p>
              <label class="btn btn-outline" style="cursor:pointer; display:inline-block;">
                📷 Fotoğraf Değiştir
                <input type="file" accept="image/*" (change)="onPhotoChange($event)" style="display:none;">
              </label>
              <button *ngIf="photoPreview" class="btn" style="margin-left:8px; color:var(--error); border-color:var(--error); background:transparent;" (click)="clearPhoto()">Kaldır</button>
            </div>
          </div>

          <!-- Fields -->
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">İsim Soyisim</label>
              <input type="text" class="form-control" [(ngModel)]="aboutForm.name_surname" placeholder="Mert KARABULUT">
            </div>
            <div class="form-group">
              <label class="form-label">Yaş</label>
              <input type="number" class="form-control" [(ngModel)]="aboutForm.age" placeholder="20">
            </div>
            <div class="form-group">
              <label class="form-label">Yaşadığım Şehir</label>
              <input type="text" class="form-control" [(ngModel)]="aboutForm.city" placeholder="İzmir">
            </div>
            <div class="form-group">
              <label class="form-label">Mesleğim</label>
              <input type="text" class="form-control" [(ngModel)]="aboutForm.profession" placeholder="Siber Güvenlik Uzmanı">
            </div>
            <div class="form-group" style="grid-column:span 2;">
              <label class="form-label">Okul / Üniversite</label>
              <input type="text" class="form-control" [(ngModel)]="aboutForm.school" placeholder="Konak Kavram MYO">
            </div>
            <div class="form-group" style="grid-column:span 2;">
              <label class="form-label">LinkedIn URL</label>
              <input type="url" class="form-control" [(ngModel)]="aboutForm.linkedin_url" placeholder="https://linkedin.com/in/...">
            </div>
            <div class="form-group" style="grid-column:span 2;">
              <label class="form-label">GitHub URL</label>
              <input type="url" class="form-control" [(ngModel)]="aboutForm.github_url" placeholder="https://github.com/...">
            </div>
            <div class="form-group" style="grid-column:span 2;">
              <label class="form-label">Açıklama (Biyografi)</label>
              <textarea class="form-control" [(ngModel)]="aboutForm.bio_paragraph" rows="6" placeholder="Kendinizi anlatan bir paragraf yazın..."></textarea>
            </div>
          </div>

          <button class="btn btn-primary" style="margin-top:8px; padding:12px 32px;" (click)="saveAboutMe()" [disabled]="saving">
            {{ saving ? 'Kaydediliyor...' : '💾 Kaydet' }}
          </button>
        </div>
      </div>

      <!-- ===================== CATEGORY SECTIONS ===================== -->
      <div *ngIf="activeSection !== 'hakkimda'">
        <div style="display:grid; grid-template-columns:320px 1fr; gap:24px; align-items:start;">

          <!-- Left: Categories -->
          <div>
            <div class="glass-card" style="padding:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h3 style="margin:0; font-size:1.1rem; color:var(--primary);">Kategoriler</h3>
                <button class="btn btn-primary" style="padding:6px 14px; font-size:0.82rem;" (click)="openCategoryForm()">+ Ekle</button>
              </div>

              <!-- Category Form (inline) -->
              <div *ngIf="showCategoryForm" class="inline-form">
                <input type="text" class="form-control" [(ngModel)]="categoryFormName" placeholder="Kategori adı..." style="margin-bottom:10px;">
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-primary" style="flex:1; padding:8px;" (click)="saveCategory()" [disabled]="saving">
                    {{ editingCategoryId ? 'Güncelle' : 'Oluştur' }}
                  </button>
                  <button class="btn btn-outline" style="padding:8px 12px;" (click)="cancelCategoryForm()">İptal</button>
                </div>
              </div>

              <div *ngIf="loadingCategories" style="color:var(--text-muted); font-size:0.9rem; padding:12px 0;">Yükleniyor...</div>
              <div *ngIf="!loadingCategories && categories.length === 0" style="color:var(--text-dim); font-size:0.85rem; padding:8px 0;">Henüz kategori yok.</div>

              <div class="cat-list">
                <div
                  *ngFor="let cat of categories"
                  class="cat-item"
                  [class.active]="selectedCategoryId === cat.id"
                  (click)="selectCategory(cat)">
                  <span class="cat-name">{{ cat.name }}</span>
                  <div class="cat-actions" (click)="$event.stopPropagation()">
                    <button class="icon-btn" title="Düzenle" (click)="editCategory(cat)">✏️</button>
                    <button class="icon-btn danger" title="Sil" (click)="deleteCategory(cat)">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Content Items -->
          <div>
            <div *ngIf="!selectedCategoryId" class="glass-card" style="padding:40px; text-align:center; color:var(--text-muted);">
              <div style="font-size:2.5rem; margin-bottom:12px;">👈</div>
              <p style="margin:0;">Soldan bir kategori seçin</p>
            </div>

            <div *ngIf="selectedCategoryId" class="glass-card" style="padding:20px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h3 style="margin:0; font-size:1.1rem; color:var(--accent);">{{ selectedCategoryName }} — İçerikler</h3>
                <button class="btn btn-primary" style="padding:6px 14px; font-size:0.82rem;" (click)="openItemForm()">+ İçerik Ekle</button>
              </div>

              <!-- Item Form (inline) -->
              <div *ngIf="showItemForm" class="inline-form" style="margin-bottom:20px;">
                <div class="form-group" style="margin-bottom:10px;">
                  <label class="form-label" style="font-size:0.8rem;">Başlık *</label>
                  <input type="text" class="form-control" [(ngModel)]="itemForm.title" placeholder="İçerik başlığı">
                </div>
                <div class="form-group" style="margin-bottom:10px;">
                  <label class="form-label" style="font-size:0.8rem;">Özet</label>
                  <input type="text" class="form-control" [(ngModel)]="itemForm.summary" placeholder="Kısa özet">
                </div>
                <div class="form-group" style="margin-bottom:10px;">
                  <label class="form-label" style="font-size:0.8rem;">İçerik *</label>
                  <textarea class="form-control" [(ngModel)]="itemForm.content" rows="4" placeholder="İçerik metni..."></textarea>
                </div>
                <div class="form-group" style="margin-bottom:10px;">
                  <label class="form-label" style="font-size:0.8rem;">Dış Bağlantı (URL)</label>
                  <input type="url" class="form-control" [(ngModel)]="itemForm.external_link" placeholder="https://...">
                </div>
                <div class="form-group" style="margin-bottom:12px;">
                  <label class="form-label" style="font-size:0.8rem;">Durum</label>
                  <select class="form-control" [(ngModel)]="itemForm.status">
                    <option value="published">Yayınlandı</option>
                    <option value="draft">Taslak</option>
                  </select>
                </div>
                <div style="display:flex; gap:8px;">
                  <button class="btn btn-primary" style="flex:1; padding:8px;" (click)="saveItem()" [disabled]="saving">
                    {{ editingItemId ? 'Güncelle' : 'Oluştur' }}
                  </button>
                  <button class="btn btn-outline" style="padding:8px 12px;" (click)="cancelItemForm()">İptal</button>
                </div>
              </div>

              <div *ngIf="loadingItems" style="color:var(--text-muted); font-size:0.9rem; padding:12px 0;">Yükleniyor...</div>
              <div *ngIf="!loadingItems && items.length === 0" style="color:var(--text-dim); font-size:0.85rem; padding:8px 0;">Bu kategoride henüz içerik yok.</div>

              <div class="item-list">
                <div *ngFor="let item of items" class="item-row">
                  <div class="item-info">
                    <span class="item-title">{{ item.title }}</span>
                    <span class="badge" [class.badge-primary]="item.status === 'published'" style="font-size:0.7rem; padding:2px 8px;">
                      {{ item.status === 'published' ? 'Yayında' : 'Taslak' }}
                    </span>
                  </div>
                  <div style="display:flex; gap:8px; flex-shrink:0;">
                    <button class="icon-btn" (click)="editItem(item)">✏️</button>
                    <button class="icon-btn danger" (click)="deleteItem(item)">🗑️</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    .section-tabs { border-bottom: 1px solid var(--border-color); padding-bottom: 0; }

    .tab-btn {
      padding: 10px 20px;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--text-muted);
      font-size: 0.92rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border-radius: 0;
      font-family: var(--font-family);
      margin-bottom: -1px;
    }
    .tab-btn:hover { color: #fff; }
    .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .photo-preview-wrap {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid var(--border-color);
      flex-shrink: 0;
      background: var(--surface-color);
    }
    .photo-preview-img { width: 100%; height: 100%; object-fit: cover; }
    .photo-preview-fallback {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--primary);
      font-family: var(--font-heading);
    }

    .inline-form {
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      padding: 16px;
      margin-bottom: 16px;
    }

    .cat-list { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
    .cat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      border-radius: var(--border-radius-sm);
      border: 1px solid var(--border-color);
      background: var(--surface-color);
      cursor: pointer;
      transition: all 0.15s;
    }
    .cat-item:hover, .cat-item.active {
      border-color: var(--primary);
      background: rgba(88,166,255,0.05);
    }
    .cat-name { font-size: 0.9rem; color: var(--text-main); }
    .cat-actions { display: flex; gap: 4px; opacity: 0; transition: opacity 0.15s; }
    .cat-item:hover .cat-actions { opacity: 1; }

    .icon-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 0.9rem;
      padding: 4px 6px;
      border-radius: 4px;
      transition: background 0.15s;
    }
    .icon-btn:hover { background: rgba(255,255,255,0.08); }
    .icon-btn.danger:hover { background: rgba(248,81,73,0.15); }

    .item-list { display: flex; flex-direction: column; gap: 8px; }
    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: var(--surface-color);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      transition: border-color 0.15s;
    }
    .item-row:hover { border-color: var(--accent); }
    .item-info { display: flex; align-items: center; gap: 10px; min-width: 0; }
    .item-title {
      font-size: 0.9rem;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 300px;
    }

    .toast-notification {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: rgba(46, 160, 67, 0.15);
      border: 1px solid rgba(46, 160, 67, 0.3);
      color: #fff;
      padding: 12px 20px;
      border-radius: var(--border-radius-sm);
      display: flex;
      align-items: center;
      gap: 10px;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
      pointer-events: none;
      z-index: 999;
    }
    .toast-notification.show { opacity: 1; transform: translateY(0); }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .form-grid .form-group[style*="span 2"] { grid-column: span 1 !important; }
      [style*="grid-template-columns:320px"] { grid-template-columns: 1fr !important; }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  public sections = SECTIONS;
  public activeSection: SectionKey = 'hakkimda';
  public user: User | null = null;
  public saving = false;

  // Toast
  public toast = { show: false, message: '', error: false };

  // Hakkımda
  public aboutForm: AboutMe = { name_surname: '', age: 0, city: '', profession: '', school: '', linkedin_url: '', github_url: '', bio_paragraph: '' };
  public photoPreview: string | null = null;
  private selectedPhotoFile: File | null = null;

  // Categories
  public categories: Category[] = [];
  public loadingCategories = false;
  public showCategoryForm = false;
  public categoryFormName = '';
  public editingCategoryId: string | null = null;

  // Selected category & items
  public selectedCategoryId: string | null = null;
  public selectedCategorySlug: string | null = null;
  public selectedCategoryName = '';
  public items: ContentItem[] = [];
  public loadingItems = false;

  // Item form
  public showItemForm = false;
  public editingItemId: string | null = null;
  public itemForm: Partial<ContentItem> = { title: '', summary: '', content: '', external_link: '', status: 'published' };

  constructor(private auth: AuthService, private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.auth.getCurrentUser().subscribe(u => this.user = u);
    this.loadAboutMe();
  }

  // --- Navigation ---
  switchSection(key: SectionKey): void {
    this.activeSection = key;
    this.selectedCategoryId = null;
    this.selectedCategorySlug = null;
    this.items = [];
    this.cancelCategoryForm();
    this.cancelItemForm();
    if (key === 'hakkimda') {
      this.loadAboutMe();
    } else {
      this.loadCategories(key);
    }
  }

  // --- Hakkımda ---
  loadAboutMe(): void {
    this.api.getAboutMe().subscribe({
      next: (data) => { this.aboutForm = { ...data }; },
      error: () => {}
    });
  }

  onPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.selectedPhotoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => { this.photoPreview = e.target?.result as string; };
    reader.readAsDataURL(file);
  }

  clearPhoto(): void {
    this.photoPreview = null;
    this.selectedPhotoFile = null;
  }

  saveAboutMe(): void {
    this.saving = true;
    const fd = new FormData();
    fd.append('name_surname', this.aboutForm.name_surname);
    fd.append('age', String(this.aboutForm.age));
    fd.append('city', this.aboutForm.city);
    fd.append('profession', this.aboutForm.profession);
    fd.append('school', this.aboutForm.school);
    fd.append('linkedin_url', this.aboutForm.linkedin_url || '');
    fd.append('github_url', this.aboutForm.github_url || '');
    fd.append('bio_paragraph', this.aboutForm.bio_paragraph);
    if (this.selectedPhotoFile) fd.append('photo', this.selectedPhotoFile);

    this.api.updateAboutMe(fd).subscribe({
      next: (data) => {
        this.aboutForm = { ...data };
        this.selectedPhotoFile = null;
        this.photoPreview = null;
        this.saving = false;
        this.showToast('Hakkımda bilgileri kaydedildi!');
      },
      error: () => { this.saving = false; this.showToast('Kayıt sırasında hata oluştu.', true); }
    });
  }

  // --- Categories ---
  loadCategories(sectionType: string): void {
    this.loadingCategories = true;
    this.api.getCategories(sectionType).subscribe({
      next: (data) => { this.categories = data; this.loadingCategories = false; },
      error: () => { this.loadingCategories = false; }
    });
  }

  openCategoryForm(): void {
    this.editingCategoryId = null;
    this.categoryFormName = '';
    this.showCategoryForm = true;
  }

  editCategory(cat: Category): void {
    this.editingCategoryId = cat.id || null;
    this.categoryFormName = cat.name;
    this.showCategoryForm = true;
  }

  cancelCategoryForm(): void {
    this.showCategoryForm = false;
    this.categoryFormName = '';
    this.editingCategoryId = null;
  }

  saveCategory(): void {
    if (!this.categoryFormName.trim()) return;
    this.saving = true;
    const payload: Partial<Category> = { name: this.categoryFormName, section_type: this.activeSection as string };
    const op = this.editingCategoryId
      ? this.api.updateCategory(this.editingCategoryId, { name: this.categoryFormName })
      : this.api.createCategory(payload);

    op.subscribe({
      next: () => {
        this.saving = false;
        this.cancelCategoryForm();
        this.loadCategories(this.activeSection);
        this.showToast(this.editingCategoryId ? 'Kategori güncellendi.' : 'Kategori oluşturuldu.');
      },
      error: () => { this.saving = false; this.showToast('Hata oluştu.', true); }
    });
  }

  deleteCategory(cat: Category): void {
    if (!cat.id || !confirm(`"${cat.name}" kategorisini silmek istediğinize emin misiniz? İçerikler de silinir.`)) return;
    this.api.deleteCategory(cat.id).subscribe({
      next: () => {
        if (this.selectedCategoryId === cat.id) { this.selectedCategoryId = null; this.items = []; }
        this.loadCategories(this.activeSection);
        this.showToast('Kategori silindi.');
      },
      error: () => this.showToast('Silme sırasında hata oluştu.', true)
    });
  }

  selectCategory(cat: Category): void {
    this.selectedCategoryId = cat.id || null;
    this.selectedCategorySlug = cat.slug || null;
    this.selectedCategoryName = cat.name;
    this.cancelItemForm();
    this.loadItemsDirect();
  }

  // --- Items ---

  openItemForm(): void {
    this.editingItemId = null;
    this.itemForm = { title: '', summary: '', content: '', external_link: '', status: 'published' };
    this.showItemForm = true;
  }

  editItem(item: ContentItem): void {
    this.editingItemId = item.id || null;
    this.itemForm = { title: item.title, summary: item.summary, content: item.content, external_link: item.external_link || '', status: item.status };
    this.showItemForm = true;
  }

  cancelItemForm(): void {
    this.showItemForm = false;
    this.editingItemId = null;
    this.itemForm = { title: '', summary: '', content: '', external_link: '', status: 'published' };
  }

  saveItem(): void {
    if (!this.itemForm.title?.trim() || !this.itemForm.content?.trim()) {
      this.showToast('Başlık ve içerik zorunludur.', true);
      return;
    }
    this.saving = true;
    const fd = new FormData();
    fd.append('title', this.itemForm.title || '');
    fd.append('summary', this.itemForm.summary || '');
    fd.append('content', this.itemForm.content || '');
    fd.append('external_link', this.itemForm.external_link || '');
    fd.append('status', this.itemForm.status || 'published');
    if (!this.editingItemId) fd.append('category', this.selectedCategoryId!);

    const op = this.editingItemId
      ? this.api.updateItem(this.editingItemId, fd)
      : this.api.createItem(fd);

    op.subscribe({
      next: () => {
        this.saving = false;
        this.cancelItemForm();
        this.loadItemsDirect();
        this.showToast(this.editingItemId ? 'İçerik güncellendi.' : 'İçerik oluşturuldu.');
      },
      error: () => { this.saving = false; this.showToast('Hata oluştu.', true); }
    });
  }

  deleteItem(item: ContentItem): void {
    if (!item.id || !confirm(`"${item.title}" içeriğini silmek istediğinize emin misiniz?`)) return;
    this.api.deleteItem(item.id).subscribe({
      next: () => { this.loadItemsDirect(); this.showToast('İçerik silindi.'); },
      error: () => this.showToast('Silme sırasında hata oluştu.', true)
    });
  }

  private loadItemsDirect(): void {
    if (!this.selectedCategorySlug) return;
    this.loadingItems = true;
    this.api.getItems(undefined, this.selectedCategorySlug).subscribe({
      next: (items) => { this.items = items; this.loadingItems = false; },
      error: () => { this.loadingItems = false; }
    });
  }

  // --- Helpers ---
  public getInitials(name: string): string {
    if (!name) return 'MK';
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  private showToast(message: string, error = false): void {
    this.toast = { show: true, message, error };
    setTimeout(() => { this.toast = { ...this.toast, show: false }; }, 3500);
  }

  public logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
