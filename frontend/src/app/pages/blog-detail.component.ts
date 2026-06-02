import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ApiService, ContentItem } from '../services/api.service';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container" *ngIf="item">

      <!-- Back Navigation -->
      <div style="margin-bottom: 32px;">
        <a routerLink="/blog" style="color: var(--text-muted); font-size: 0.95rem;" class="hover-underline">← Kütüphaneye Dön</a>
      </div>

      <!-- Main Article Frame -->
      <article style="max-width: 800px; margin: 0 auto;">

        <!-- Post Header -->
        <header style="margin-bottom: 48px; border-bottom: 1px solid var(--glass-border); padding-bottom: 32px;">
          <div style="display: flex; gap: 12px; align-items: center; margin-bottom: 16px;">
            <span class="badge badge-primary">{{ item.category_name }}</span>
            <span style="color: var(--text-dim); font-size: 0.9rem;">{{ item.created_at | date:'dd MMMM yyyy' }}</span>
          </div>

          <h1 style="margin-bottom: 24px; font-size: clamp(2rem, 4vw, 3rem); line-height: 1.2;">{{ item.title }}</h1>

          <p style="font-size: 1.2rem; line-height: 1.6; color: var(--text-muted); font-style: italic;">
            {{ item.summary }}
          </p>
        </header>

        <!-- Post Cover Image (Optional) -->
        <div *ngIf="item.image" style="margin-bottom: 48px; border-radius: var(--border-radius); overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.2);">
          <img [src]="item.image" alt="Article Cover" style="width: 100%; height: auto; max-height: 450px; object-fit: cover;">
        </div>

        <!-- Rendered Post Content (HTML) -->
        <div class="article-reader" [innerHTML]="safeContent"></div>

        <!-- External Link (Optional) -->
        <div *ngIf="item.external_link" class="glass-panel" style="margin-top: 60px; padding: 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
          <div>
            <h4 style="font-family: 'Outfit', sans-serif; font-size: 1.1rem; margin-bottom: 6px;">İlgili Dış Kaynak Linki</h4>
            <p style="font-size: 0.95rem; color: var(--text-dim);">Bu içerikle ilgili daha fazla bilgi edinmek için harici kaynağı inceleyebilirsiniz.</p>
          </div>
          <a [href]="item.external_link" target="_blank" class="btn btn-primary">Kaynağa Git 🔗</a>
        </div>

      </article>

    </div>

    <!-- Loading State -->
    <div class="container" *ngIf="isLoading">
      <div class="flex-center" style="padding: 150px 0;">
        <div class="loader"></div>
      </div>
    </div>

    <!-- Error State -->
    <div class="container" *ngIf="!isLoading && !item">
      <div class="glass-panel flex-center" style="padding: 100px; flex-direction: column; text-align: center;">
        <h2 style="margin-bottom: 16px;">Yazı Bulunamadı</h2>
        <p style="margin-bottom: 24px;">Aradığınız blog yazısı mevcut olmayabilir veya silinmiş olabilir.</p>
        <a routerLink="/blog" class="btn btn-primary">Kütüphaneye Dön</a>
      </div>
    </div>
  `,
  styles: [`
    .hover-underline:hover {
      text-decoration: underline;
      color: var(--primary) !important;
    }
  `]
})
export class BlogDetailComponent implements OnInit {
  public item: ContentItem | null = null;
  public safeContent: SafeHtml = '';
  public isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.api.getItem(slug).subscribe({
        next: (res) => {
          this.item = res;
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.parseMarkdown(res.content));
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Error loading blog details:", err);
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  private parseMarkdown(md: string): string {
    if (!md) return '';
    let html = md;

    html = html
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const decodedCode = code
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      return `<pre><code class="language-${lang}">${decodedCode.trim()}</code></pre>`;
    });

    html = html.replace(/`([^`]+)`/g, (match, code) => {
      const decodedInline = code
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
      return `<code>${decodedInline}</code>`;
    });

    html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
    html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const decodedUrl = url.replace(/&amp;/g, '&');
      return `<a href="${decodedUrl}" target="_blank" style="color: var(--primary); text-decoration: underline;">${text}</a>`;
    });

    html = html.replace(/^\- (.*?)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*?<\/li>\s*)+)/gs, '<ul>$1</ul>');

    const parts = html.split(/\n\n+/);
    html = parts.map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      if (
        trimmed.startsWith('<pre>') ||
        trimmed.startsWith('<h2>') ||
        trimmed.startsWith('<h3>') ||
        trimmed.startsWith('<h1>') ||
        trimmed.startsWith('<ul>')
      ) {
        return trimmed;
      }
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');

    return html;
  }
}
