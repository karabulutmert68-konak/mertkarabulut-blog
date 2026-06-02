import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-category-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div style="text-align: center; margin-bottom: 60px;">
        <h1 style="color: var(--primary);">{{ title }}</h1>
        <p style="color: var(--text-muted); font-size: 1.1rem; max-width: 600px; margin: 0 auto;">
          {{ description }}
        </p>
      </div>

      <div *ngIf="isLoading" style="text-align: center; padding: 40px;">
        <p>Yükleniyor...</p>
      </div>

      <div *ngIf="!isLoading && contents.length === 0" style="text-align: center; padding: 40px;" class="glass-card">
        <p>Henüz bu kategoriye ait bir içerik bulunmuyor.</p>
      </div>

      <div *ngIf="!isLoading && contents.length > 0" class="grid-2">
        <div *ngFor="let item of contents" class="glass-card reveal-on-scroll" style="display: flex; flex-direction: column;">
          <div *ngIf="item.featured_image" style="height: 200px; border-radius: var(--border-radius-sm); margin-bottom: 20px; overflow: hidden;">
            <img [src]="item.featured_image" alt="" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
          <h3 style="margin-bottom: 12px;">{{ item.title }}</h3>
          <p style="color: var(--text-muted); flex: 1;">{{ item.excerpt || (item.content | slice:0:150) + '...' }}</p>
          <div style="margin-top: 24px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.85rem; color: var(--secondary);">{{ item.created_at | date:'dd MMM yyyy' }}</span>
            <a [routerLink]="['/blog', item.slug]" class="btn btn-outline" style="padding: 8px 16px;">Devamını Oku</a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CategoryViewComponent implements OnInit {
  categorySlug: string = '';
  title: string = '';
  description: string = '';
  contents: any[] = [];
  isLoading: boolean = true;

  private categoryMap: { [key: string]: { title: string, desc: string, apiType: string } } = {
    'teknik-bilgi': { title: 'Teknik Bilgi', desc: 'Siber güvenlik, ağ yapıları, yazılım geliştirme ve sistem yönetimi üzerine detaylı teknik notlarım.', apiType: 'technical' },
    'teknik-olmayan-bilgi': { title: 'Teknik Olmayan Bilgi', desc: 'Kişisel gelişim, kariyer tavsiyeleri ve teknoloji dünyasına dair genel düşüncelerim.', apiType: 'non_technical' },
    'arastirmalarim': { title: 'Araştırmalarım', desc: 'Akademik araştırmalarım, siber istihbarat raporları ve vaka analizlerim.', apiType: 'research' },
    'hobilerim': { title: 'Hobilerim', desc: 'İş dışında vakit ayırdığım aktiviteler ve ilgi alanlarım.', apiType: 'hobby' },
    'kitaplar': { title: 'Okuduğum Kitaplar', desc: 'Ufuk açıcı bulduğum, okuyup değerlendirdiğim teknik ve edebiyat kitapları.', apiType: 'book' }
  };

  constructor(private route: ActivatedRoute, private apiService: ApiService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.categorySlug = params.get('type') || '';
      const mapped = this.categoryMap[this.categorySlug];

      if (mapped) {
        this.title = mapped.title;
        this.description = mapped.desc;
        this.fetchContents(mapped.apiType);
      } else {
        this.title = 'Kategori Bulunamadı';
        this.isLoading = false;
      }
    });
  }

  fetchContents(apiType: string) {
    this.isLoading = true;
    this.apiService.getItems(apiType).subscribe({
      next: (data: any) => {
        this.contents = data.results || data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
