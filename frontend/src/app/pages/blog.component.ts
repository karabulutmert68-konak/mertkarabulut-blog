import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Category, ContentItem } from '../services/api.service';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Page Header (Small banner style) -->
    <div class="container" style="margin-bottom: 40px; padding-top: 20px;">
      <span class="badge badge-primary" style="margin-bottom: 12px;">Yazılar & Araştırmalar</span>
      <h1 style="margin-bottom: 12px; font-size: 2.8rem;">Kişisel Kütüphane</h1>
      <p style="max-width: 700px; color: var(--text-muted);">
        Hem siber güvenlik ve teknik konular hem de üretkenlik, kişisel gelişim ve okuduğum kitaplar üzerine aldığım tüm notlar.
      </p>
    </div>

    <div class="container blog-layout">

      <!-- Main Content Area: Articles List -->
      <main class="blog-main-content">
        <div *ngIf="isLoading" class="flex-center" style="padding: 100px 0;">
          <div class="loader"></div>
        </div>

        <div *ngIf="!isLoading">
          <div *ngIf="items.length > 0; else emptyState">
            <div class="article-list-card reveal-on-scroll" *ngFor="let item of items">
              <div class="meta">
                <span class="badge badge-primary">{{ item.category_name }}</span>
                <span>{{ item.created_at | date:'dd.MM.yyyy' }}</span>
              </div>
              <a [routerLink]="['/blog', item.slug]">
                <h3>{{ item.title }}</h3>
              </a>
              <p style="margin: 12px 0;">{{ item.summary }}</p>

              <div style="display: flex; gap: 12px; margin-top: 8px;">
                <a [routerLink]="['/blog', item.slug]" class="btn btn-secondary" style="padding: 8px 16px; font-size: 0.85rem; border-color: rgba(255,255,255,0.08);">
                  Okumaya Başla →
                </a>
                <a *ngIf="item.external_link" [href]="item.external_link" target="_blank" class="btn btn-secondary" style="padding: 8px 12px; font-size: 0.85rem; border-color: var(--primary-glow);" title="Harici Kaynak Bağlantısı">
                  🔗 Kaynak
                </a>
              </div>
            </div>
          </div>

          <ng-template #emptyState>
            <div class="glass-panel flex-center" style="padding: 80px; flex-direction: column; text-align: center;">
              <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 20px;">Bu kategoride henüz yayınlanmış bir içerik bulunmuyor.</p>
              <button class="btn btn-secondary" (click)="onSelectCategory('')">Filtreleri Temizle</button>
            </div>
          </ng-template>
        </div>
      </main>

      <!-- Sidebar Area: Sections and Subcategories -->
      <aside class="sidebar">
        <!-- Section Selector -->
        <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 12px;">
          <h4 style="font-size: 1.1rem; color: var(--text-main); font-family: 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--glass-border); padding-bottom: 8px; margin-bottom: 8px;">
            Bölümler
          </h4>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <button
              *ngFor="let sec of sections"
              (click)="onSelectSection(sec.id)"
              [class.active]="activeSection === sec.id"
              class="sec-tab-btn-vertical">
              {{ sec.name }}
            </button>
          </div>
        </div>

        <!-- Categories Selector -->
        <div class="glass-panel" style="padding: 24px; display: flex; flex-direction: column; gap: 12px;" *ngIf="categories.length > 0">
          <h4 style="font-size: 1.1rem; color: var(--text-main); font-family: 'Outfit', sans-serif; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--glass-border); padding-bottom: 8px; margin-bottom: 8px;">
            Alt Kategoriler
          </h4>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <button
              (click)="onSelectCategory('')"
              [class.active]="activeCategorySlug === ''"
              class="cat-filter-btn-vertical">
              Tümü
            </button>
            <button
              *ngFor="let cat of categories"
              (click)="onSelectCategory(cat.slug || '')"
              [class.active]="activeCategorySlug === cat.slug"
              class="cat-filter-btn-vertical">
              <span>{{ cat.name }}</span>
              <span style="font-size: 0.75rem; opacity: 0.6;">({{ cat.item_count }})</span>
            </button>
          </div>
        </div>
      </aside>

    </div>
  `,
  styles: [`
    .sec-tab-btn-vertical {
      width: 100%;
      text-align: left;
      padding: 10px 16px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-family: 'Outfit', sans-serif;
      font-size: 0.95rem;
      font-weight: 500;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      transition: all 0.2s;
    }
    .sec-tab-btn-vertical:hover {
      color: var(--text-main);
      background-color: rgba(255, 255, 255, 0.03);
    }
    .sec-tab-btn-vertical.active {
      color: #0d1117;
      background-color: var(--primary);
      box-shadow: 0 4px 15px var(--primary-glow);
    }

    .cat-filter-btn-vertical {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 14px;
      border: 1px solid transparent;
      background: transparent;
      color: var(--text-muted);
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 400;
      transition: all 0.2s;
    }
    .cat-filter-btn-vertical:hover {
      background-color: rgba(255, 255, 255, 0.02);
      color: var(--text-main);
    }
    .cat-filter-btn-vertical.active {
      border-color: var(--primary-glow);
      color: var(--primary);
      background-color: var(--primary-glow);
    }
  `]
})
export class BlogComponent implements OnInit {
  public sections = [
    { id: 'technical', name: 'Teknik Bilgi' },
    { id: 'non_technical', name: 'Teknik Olmayan' },
    { id: 'research', name: 'Araştırmalarım' },
    { id: 'hobby', name: 'Hobilerim' },
    { id: 'book', name: 'Kitaplarım' }
  ];

  public activeSection = 'technical';
  public activeCategorySlug = '';
  public categories: Category[] = [];
  public items: ContentItem[] = [];
  public isLoading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadData();
  }

  public onSelectSection(sectionId: string): void {
    this.activeSection = sectionId;
    this.activeCategorySlug = '';
    this.loadData();
  }

  public onSelectCategory(slug: string): void {
    this.activeCategorySlug = slug;
    this.loadItems();
  }

  private loadData(): void {
    this.isLoading = true;
    this.api.getCategories(this.activeSection).subscribe({
      next: (cats) => {
        this.categories = cats;
        this.loadItems();
      },
      error: (err) => {
        console.error("Error fetching categories:", err);
        this.isLoading = false;
      }
    });
  }

  private loadItems(): void {
    this.isLoading = true;
    this.api.getItems(this.activeSection, this.activeCategorySlug).subscribe({
      next: (contentItems) => {
        this.items = contentItems;
        this.isLoading = false;
      },
      error: (err) => {
        console.error("Error fetching items:", err);
        this.isLoading = false;
      }
    });
  }
}
