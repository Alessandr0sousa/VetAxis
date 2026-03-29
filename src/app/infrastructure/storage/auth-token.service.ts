import { Injectable, PLATFORM_ID, OnDestroy, computed, inject, signal, afterNextRender, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { UserProfileService } from './user-profile.service';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenService implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly userProfileService = inject(UserProfileService);
  private readonly token = signal<string | null>(null);
  readonly authenticated = computed(() => !!this.token());
  private expirationCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Carrega o token após a aplicação estar inicializada no navegador
    afterNextRender(() => {
      const savedToken = this.readToken();
      if (savedToken) {
        this.token.set(savedToken);
      }
      this.startExpirationCheck();
      this.setupVisibilityListener();
    });

    // Monitora mudanças no token
    effect(() => {
      const currentToken = this.token();
      if (!currentToken) {
        this.stopExpirationCheck();
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
    this.stopExpirationCheck();
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

  private startExpirationCheck(): void {
    // Inicia verificação a cada 1 minuto
    if (!this.isBrowser() || this.expirationCheckInterval) {
      return;
    }

    this.expirationCheckInterval = setInterval(() => {
      if (this.isTokenExpired()) {
        this.handleExpiredToken();
      }
    }, 60000); // 60 segundos
  }

  private stopExpirationCheck(): void {
    if (this.expirationCheckInterval) {
      clearInterval(this.expirationCheckInterval);
      this.expirationCheckInterval = null;
    }
  }

  private setupVisibilityListener(): void {
    if (!this.isBrowser()) {
      return;
    }

    document.addEventListener('visibilitychange', () => {
      // Quando documento fica visível, verifica imediatamente se token expirou
      if (!document.hidden && this.isTokenExpired()) {
        this.handleExpiredToken();
      }
    });
  }

  private handleExpiredToken(): void {
    this.clearToken();
    this.userProfileService.clearUserProfile();

    if (this.isBrowser() && this.router.url !== '/login') {
      void this.router.navigate(['/login'], { replaceUrl: true });
    }
  }

  ngOnDestroy() {
    this.stopExpirationCheck();
  }
}
