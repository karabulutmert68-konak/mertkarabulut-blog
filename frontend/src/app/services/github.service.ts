import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, switchMap } from 'rxjs';

export interface GithubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
  fork: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GithubService {
  private readonly username = 'karabulutmert68-konak';
  private readonly apiUrl = `https://api.github.com/users/${this.username}/repos`;

  constructor(private http: HttpClient) {}

  public getRepositories(): Observable<GithubRepo[]> {
    return this.fetchAllPages(1, []);
  }

  private fetchAllPages(page: number, acc: GithubRepo[]): Observable<GithubRepo[]> {
    return this.http.get<GithubRepo[]>(
      `${this.apiUrl}?sort=updated&per_page=100&page=${page}`
    ).pipe(
      switchMap(repos => {
        const combined = [...acc, ...repos];
        return repos.length === 100 ? this.fetchAllPages(page + 1, combined) : of(combined);
      })
    );
  }
}
