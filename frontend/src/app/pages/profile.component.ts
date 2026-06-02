import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService, User } from '../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container" style="padding-top: 60px; padding-bottom: 100px; max-width: 800px;">
      <div class="glass-card" style="padding: 40px; text-align: center; position: relative; overflow: hidden;">
        <!-- Arka plan dekorasyonu -->
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100px; background: linear-gradient(135deg, rgba(88,166,255,0.2) 0%, rgba(30,30,46,0) 100%); z-index: 0;"></div>
        
        <div style="position: relative; z-index: 1;">
          <div style="width: 100px; height: 100px; border-radius: 50%; background: var(--surface-color); border: 2px solid var(--primary); margin: 0 auto 20px auto; display: flex; justify-content: center; align-items: center;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          
          <h1 style="color: var(--primary); margin-bottom: 8px;">{{ user?.username }}</h1>
          <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 32px;">
            {{ user?.email || 'E-posta adresi belirtilmemiş' }}
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
            <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color);">
              <span style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">Hesap Durumu</span>
              <span style="color: var(--secondary); font-weight: bold;">Aktif Üye</span>
            </div>
            <div style="background: rgba(0,0,0,0.2); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color);">
              <span style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">Rol</span>
              <span style="color: var(--text-main); font-weight: bold;">
                {{ user?.is_staff ? 'Yönetici' : 'Okur' }}
              </span>
            </div>
          </div>

          <div style="text-align: center;">
            <p style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 24px;">
              Şu anki versiyonda hesap ayarları ve yorum yapma özellikleri geliştirilme aşamasındadır. Takipte kalın!
            </p>
            <button (click)="logout()" class="btn btn-outline" style="border-color: var(--error); color: var(--error); padding: 8px 32px;">
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: User | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.authService.getCurrentUser().subscribe(u => {
      this.user = u;
      if (!this.user) {
        this.router.navigate(['/login']);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
