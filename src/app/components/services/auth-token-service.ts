import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly token = signal<string | null>(this.readToken());
  readonly authenticated = computed(() => !!this.token());

  setToken(token: string): void {
    if (!this.isBrowser()) {
      return;
    }
    sessionStorage.setItem('authToken', token);
    this.token.set(token);
  }

  getToken(): string | null {
    return this.token();
  }

  clearToken(): void {
    if (!this.isBrowser()) {
      return;
    }
    sessionStorage.removeItem('authToken');
    this.token.set(null);
  }

  isAuthenticated(): boolean {
    return this.authenticated();
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private readToken(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return sessionStorage.getItem('authToken');
  }
}
