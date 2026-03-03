import { Injectable, PLATFORM_ID, computed, inject, signal, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly token = signal<string | null>(null);
  readonly authenticated = computed(() => !!this.token());

  constructor() {
    // Carrega o token após a aplicação estar inicializada no navegador
    afterNextRender(() => {
      const savedToken = this.readToken();
      if (savedToken) {
        this.token.set(savedToken);
      }
    });
  }

  setToken(token: string): void {
    if (!this.isBrowser()) {
      return;
    }
    sessionStorage.setItem('authToken', token);
    this.token.set(token);
  }

  getToken(): string | null {
    const token = this.token();

    // Retorna o token mesmo se expirado - a validação será feita no guard/interceptor
    return token;
  }

  clearToken(): void {
    if (!this.isBrowser()) {
      return;
    }
    sessionStorage.removeItem('authToken');
    this.token.set(null);
  }

  isAuthenticated(): boolean {
    return this.isTokenValid();
  }

  isTokenValid(): boolean {
    const token = this.token();
    return !!token && !this.isTokenExpired();
  }

  private isTokenExpired(): boolean {
    const token = this.token();
    if (!token) return true;

    try {
      // Decodifica o payload do JWT (parte do meio)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;

      if (!exp) return false; // Se não tem exp, considera válido

      // Verifica se expirou (exp está em segundos, Date.now() em milissegundos)
      return Date.now() >= exp * 1000;
    } catch {
      // Se não conseguir decodificar, considera expirado
      return true;
    }
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
