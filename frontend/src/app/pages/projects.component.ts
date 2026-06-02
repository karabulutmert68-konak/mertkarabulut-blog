import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Project } from '../services/api.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container" style="padding-top: 40px; min-height: 70vh;">

      <div style="text-align: center; margin-bottom: 48px;">
        <span class="badge badge-primary" style="margin-bottom: 12px;">Yazılım Projelerim</span>
        <h1 class="text-gradient" style="margin-bottom: 16px;">Projelerim</h1>
        <p style="max-width: 620px; margin: 0 auto;">Geliştirdiğim yazılım projeleri, araştırmalar ve eğitim amaçlı repolar.</p>
      </div>

      <!-- Language Filter -->
      <div *ngIf="!isLoading && !errorMessage && languages.length > 1" class="lang-filter-pills">
        <button class="lang-pill" [class.active]="activeFilter === ''" (click)="setFilter('')">Tümü ({{ repos.length }})</button>
        <button
          *ngFor="let lang of languages"
          class="lang-pill"
          [class.active]="activeFilter === lang"
          (click)="setFilter(lang)">
          {{ lang }}
        </button>
      </div>

      <div *ngIf="isLoading" class="flex-center" style="padding: 80px;">
        <span class="loader" style="width: 40px; height: 40px; border-width: 4px;"></span>
      </div>

      <div *ngIf="errorMessage" style="padding: 16px; background-color: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: var(--border-radius-sm); color: var(--error); text-align: center; margin-bottom: 24px;">
        {{ errorMessage }}
      </div>

      <div *ngIf="!isLoading && !errorMessage" class="grid-2">
        <div *ngFor="let repo of filteredRepos" class="glass-card repo-card" style="display: flex; flex-direction: column; height: 100%;">

          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
            <h3 style="margin: 0; font-size: 1.3rem; color: var(--primary);">{{ repo.name }}</h3>
            <a [href]="repo.github_url" target="_blank" rel="noopener noreferrer" style="color: var(--text-dim); transition: color 0.2s; flex-shrink: 0; margin-left: 8px;" title="GitHub'da Görüntüle">
              <svg height="22" width="22" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
            </a>
          </div>

          <p style="flex-grow: 1; margin-bottom: 24px; font-size: 0.95rem; line-height: 1.6; color: var(--text-muted);">
            {{ repo.description || 'Bu proje için henüz bir açıklama girilmemiş.' }}
          </p>

          <div style="display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-dim); align-items: center; border-top: 1px solid var(--glass-border); padding-top: 16px; flex-wrap: wrap;">
            <div *ngIf="repo.language" style="display: flex; align-items: center; gap: 6px;">
              <span class="lang-dot" [class]="repo.language.toLowerCase()"></span>
              {{ repo.language }}
            </div>
            <div style="display: flex; align-items: center; gap: 4px;">⭐ {{ repo.stars }}</div>
            <div style="display: flex; align-items: center; gap: 4px;">🍴 {{ repo.forks }}</div>
            <div style="margin-left: auto;">{{ repo.updated_at | date:'dd.MM.yyyy' }}</div>
          </div>

        </div>

        <div *ngIf="filteredRepos.length === 0" style="grid-column: 1 / -1; text-align: center; padding: 60px; color: var(--text-muted);">
          Bu filtre için gösterilecek proje bulunamadı.
        </div>
      </div>

      <!-- GitHub Profile Link -->
      <div *ngIf="!isLoading" style="text-align: center; margin-top: 48px;">
        <a href="https://github.com/karabulutmert68-konak" target="_blank" class="btn btn-secondary" style="gap: 10px;">
          <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          Tüm GitHub Profilimi Görüntüle
        </a>
      </div>

    </div>
  `,
  styles: [`
    .repo-card {
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .repo-card:hover {
      transform: translateY(-8px) scale(1.02);
      border-color: var(--primary);
    }
    .repo-card a:hover {
      color: var(--text-main) !important;
    }
    .lang-dot {
      display: inline-block;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: var(--primary);
    }
    .lang-dot.c\\# { background-color: #178600; }
    .lang-dot.typescript { background-color: #3178c6; }
    .lang-dot.javascript { background-color: #f1e05a; }
    .lang-dot.html { background-color: #e34c26; }
    .lang-dot.css { background-color: #563d7c; }
    .lang-dot.python { background-color: #3572A5; }
    .lang-filter-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 32px;
    }
    .lang-pill {
      padding: 6px 16px;
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-muted);
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .lang-pill:hover {
      border-color: var(--primary);
      color: var(--primary);
    }
    .lang-pill.active {
      background: var(--primary);
      color: #0d1117;
      border-color: var(--primary);
    }
  `]
})
export class ProjectsComponent implements OnInit {
  public repos: Project[] = [];
  public filteredRepos: Project[] = [];
  public languages: string[] = [];
  public activeFilter = '';
  public isLoading = true;
  public errorMessage = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getProjects().subscribe({
      next: (data) => {
        this.repos = data;
        this.filteredRepos = data;
        this.languages = [...new Set(data.map(r => r.language).filter(Boolean))];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Projeler yüklenirken bir sorun oluştu.';
        this.isLoading = false;
      }
    });
  }

  public setFilter(lang: string): void {
    this.activeFilter = lang;
    this.filteredRepos = lang ? this.repos.filter(r => r.language === lang) : this.repos;
  }
}
