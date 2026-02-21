import { Component, DestroyRef, computed, inject, signal, afterNextRender } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { MenuPrincipal } from './components/menu-principal/menu-principal';
import { Navbar } from './components/navbar/navbar';
import { CommonModule } from '@angular/common';
import { AuthTokenService } from './components/services/auth-token-service';
import { NavigationStateService } from './components/services/navigation-state-service';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuPrincipal, Navbar, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'], // ✅ corrigido
})
export class App {
  protected readonly title = signal('VetAxis');
  readonly ready = signal(false);
  private readonly tokenService = inject(AuthTokenService);
  private readonly navState = inject(NavigationStateService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly isAuthenticated = computed(() => this.tokenService.isAuthenticated());
  readonly showLayout = computed(() => this.isAuthenticated());
  isCollapsed = false;

  constructor() {
    afterNextRender(() => {
      this.ready.set(true);
    });

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((event) => {
        this.navState.setLastRoute(event.urlAfterRedirects);
      });

    if (this.isAuthenticated() && this.router.url === '/login') {
      const target = this.navState.getLastRoute() ?? '/dashboard';
      this.router.navigateByUrl(target);
    }
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}
