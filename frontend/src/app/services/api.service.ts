import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Project {
  id: string;
  name: string;
  description: string;
  language: string;
  github_url: string;
  stars: number;
  forks: number;
  order: number;
  updated_at: string;
}

export interface AboutMe {
  id?: string;
  name_surname: string;
  age: number;
  city: string;
  profession: string;
  school: string;
  linkedin_url: string;
  github_url: string;
  bio_paragraph: string;
  photo?: string;
  updated_at?: string;
}

export interface Category {
  id?: string;
  name: string;
  slug?: string;
  section_type: string;
  section_type_display?: string;
  item_count?: number;
}

export interface ContentItem {
  id?: string;
  category: string;
  category_name?: string;
  category_slug?: string;
  category_section?: string;
  title: string;
  slug?: string;
  summary: string;
  content: string;
  image?: string;
  external_link?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:8000/api';

  constructor(private http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // --- READ ---
  public getAboutMe(): Observable<AboutMe> {
    return this.http.get<AboutMe>(`${this.baseUrl}/aboutme/`);
  }

  public getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.baseUrl}/projects/`);
  }

  public getCategories(sectionType?: string): Observable<Category[]> {
    let params = new HttpParams();
    if (sectionType) params = params.set('section_type', sectionType);
    return this.http.get<Category[]>(`${this.baseUrl}/categories/`, { params });
  }

  public getItems(sectionType?: string, categorySlug?: string): Observable<ContentItem[]> {
    let params = new HttpParams();
    if (sectionType) params = params.set('section_type', sectionType);
    if (categorySlug) params = params.set('category_slug', categorySlug);
    return this.http.get<ContentItem[]>(`${this.baseUrl}/items/`, { params });
  }

  public getItem(slugOrId: string): Observable<ContentItem> {
    return this.http.get<ContentItem>(`${this.baseUrl}/items/${slugOrId}/`);
  }

  // --- AboutMe WRITE ---
  public updateAboutMe(data: FormData): Observable<AboutMe> {
    return this.http.put<AboutMe>(`${this.baseUrl}/aboutme/`, data, { headers: this.authHeaders() });
  }

  // --- Category WRITE ---
  public createCategory(data: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.baseUrl}/categories/`, data, { headers: this.authHeaders() });
  }

  public updateCategory(id: string, data: Partial<Category>): Observable<Category> {
    return this.http.patch<Category>(`${this.baseUrl}/categories/${id}/`, data, { headers: this.authHeaders() });
  }

  public deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/categories/${id}/`, { headers: this.authHeaders() });
  }

  // --- ContentItem WRITE ---
  public createItem(data: FormData): Observable<ContentItem> {
    return this.http.post<ContentItem>(`${this.baseUrl}/items/`, data, { headers: this.authHeaders() });
  }

  public updateItem(id: string, data: FormData): Observable<ContentItem> {
    return this.http.patch<ContentItem>(`${this.baseUrl}/items/${id}/`, data, { headers: this.authHeaders() });
  }

  public deleteItem(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/items/${id}/`, { headers: this.authHeaders() });
  }
}
