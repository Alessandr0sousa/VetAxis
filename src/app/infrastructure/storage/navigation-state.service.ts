import { Injectable, PLATFORM_ID, computed, inject, signal, afterNextRender } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class NavigationStateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly lastRoute = signal<string | null>(null);
  readonly lastRouteSignal = computed(() => this.lastRoute());

  constructor() {
    // Carrega a última rota após a aplicação estar inicializada
    afterNextRender(() => {
      const route = this.readLastRoute();
      if (route) {
        this.lastRoute.set(route);
      }
    });
  }

  setLastRoute(route: string): void {
    if (!this.isBrowser() || route === '/login') {
      return;
    }
    if (!route.startsWith('/')) {
      route = `/${route}`;
    }
    sessionStorage.setItem('lastRoute', route);
    this.lastRoute.set(route);
  }

  getLastRoute(): string | null {
    return this.lastRoute();
  }

  consumeLastRoute(): string | null {
    const route = this.lastRoute();
    this.clearLastRoute();
    return route;
  }

  clearLastRoute(): void {
    if (!this.isBrowser()) {
      return;
    }
    sessionStorage.removeItem('lastRoute');
    this.lastRoute.set(null);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private readLastRoute(): string | null {
    if (!this.isBrowser()) {
      return null;
    }
    return sessionStorage.getItem('lastRoute');
  }
}
