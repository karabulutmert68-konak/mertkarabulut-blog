import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container" style="display: flex; justify-content: center; align-items: center; min-height: 60vh;">
      <div class="glass-card" style="width: 100%; max-width: 400px; padding: 40px;">
        <h2 style="text-align: center; margin-bottom: 32px; color: var(--primary);">Giriş Yap</h2>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Kullanıcı Adı</label>
            <input type="text" formControlName="username" class="form-control" placeholder="Kullanıcı adınız" required>
          </div>

          <div class="form-group" style="margin-bottom: 32px;">
            <label class="form-label">Şifre</label>
            <input type="password" formControlName="password" class="form-control" placeholder="••••••••" required>
          </div>

          <div *ngIf="error" style="color: var(--error); margin-bottom: 16px; font-size: 0.95rem; text-align: center; padding: 10px; background-color: rgba(239, 68, 68, 0.1); border-radius: 4px;">
            {{ error }}
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;" [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap' }}
          </button>
          
          <div style="text-align: center; margin-top: 24px; font-size: 0.9rem;">
            Hesabın yok mu? <a routerLink="/register" style="color: var(--primary); text-decoration: none;">Kayıt Ol</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.cdr.detectChanges();

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          // fetchCurrentUser will run in tap(), so we wait a tick to let the behavior subject update
          setTimeout(() => {
             const user = this.authService.currentUserValue;
             if (user?.is_staff) {
               this.router.navigate(['/admin']);
             } else {
               this.router.navigate(['/']);
             }
          }, 300);
        },
        error: (err) => {
          console.error("Login hatası:", err);
          this.isLoading = false;
          this.error = 'Kullanıcı adı veya şifre hatalı.';
          this.cdr.detectChanges();
        }
      });
    }
  }
}
