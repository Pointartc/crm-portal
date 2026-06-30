import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

import { LoginResponse } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<LoginResponse | null>(null);

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>('https://dummyjson.com/auth/login', { username, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('auth_token', res.token);
          this.currentUser.set(res);
        })
      );
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  logout(): void {
    localStorage.clear();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
