import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="container" style="display: flex; justify-content: center; align-items: center; min-height: 70vh;">
      <div class="glass-card" style="width: 100%; max-width: 450px; padding: 40px;">
        <h2 style="text-align: center; margin-bottom: 32px; color: var(--primary);">Kayıt Ol</h2>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label">Kullanıcı Adı</label>
            <input type="text" formControlName="username" class="form-control" placeholder="Örn: siberuzman" required>
          </div>
          
          <div class="form-group">
            <label class="form-label">E-posta Adresi (Opsiyonel)</label>
            <input type="email" formControlName="email" class="form-control" placeholder="mail@example.com">
          </div>

          <div class="form-group" style="margin-bottom: 32px;">
            <label class="form-label">Şifre</label>
            <input type="password" formControlName="password" class="form-control" placeholder="••••••••" required>
          </div>

          <div *ngIf="error" style="color: var(--error); margin-bottom: 16px; font-size: 0.95rem; text-align: center; padding: 10px; background-color: rgba(239, 68, 68, 0.1); border-radius: 4px;">
            {{ error }}
          </div>
          
          <div *ngIf="success" style="color: var(--secondary); margin-bottom: 16px; font-size: 0.95rem; text-align: center; padding: 10px; background-color: rgba(16, 185, 129, 0.1); border-radius: 4px;">
            {{ success }}
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;" [disabled]="registerForm.invalid || isLoading">
            {{ isLoading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol' }}
          </button>
          
          <div style="text-align: center; margin-top: 24px; font-size: 0.9rem;">
            Zaten hesabın var mı? <a routerLink="/login" style="color: var(--primary); text-decoration: none;">Giriş Yap</a>
          </div>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;
  error: string = '';
  success: string = '';
  isLoading: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', Validators.email],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.success = '';
      this.cdr.detectChanges();

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.isLoading = false;
          this.success = 'Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...';
          this.cdr.detectChanges();
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.error && err.error.username) {
             this.error = 'Bu kullanıcı adı zaten alınmış.';
          } else {
             this.error = 'Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.';
          }
          this.cdr.detectChanges();
        }
      });
    }
  }
}
