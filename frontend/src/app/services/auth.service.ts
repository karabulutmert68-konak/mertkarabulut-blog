import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiTokenUrl = `${environment.apiUrl}/token/`;
  private apiRegisterUrl = `${environment.apiUrl}/register/`;
  private apiMeUrl = `${environment.apiUrl}/me/`;

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  constructor(private http: HttpClient) {
    if (this.hasToken()) {
      this.fetchCurrentUser().subscribe();
    }
  }

  login(credentials: any): Observable<any> {
    return this.http.post(this.apiTokenUrl, credentials).pipe(
      tap({
        next: (res: any) => {
          localStorage.setItem('access_token', res.access);
          localStorage.setItem('refresh_token', res.refresh);
          this.isLoggedInSubject.next(true);
          this.fetchCurrentUser().subscribe();
        },
        error: (err) => console.error('AuthService login hatası:', err)
      }),
      catchError(err => throwError(() => err))
    );
  }

  register(credentials: any): Observable<any> {
    return this.http.post(this.apiRegisterUrl, credentials);
  }

  fetchCurrentUser(): Observable<User> {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<User>(this.apiMeUrl, { headers }).pipe(
      tap({
        next: (user) => this.currentUserSubject.next(user),
        error: () => this.logout() // Token expires or invalid
      })
    );
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }

  hasToken(): boolean {
    if (typeof window !== 'undefined' && window.localStorage) {
        return !!localStorage.getItem('access_token');
    }
    return false;
  }

  isLoggedIn(): Observable<boolean> {
    return this.isLoggedInSubject.asObservable();
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('access_token');
    }
    return null;
  }
}
