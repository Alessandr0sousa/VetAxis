import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthTokenService } from '../components/services/auth-token-service';
import { NavigationStateService } from '../components/services/navigation-state-service';

export const authGuard: CanActivateChildFn = (_route, state) => {
  const router = inject(Router);
  const tokenService = inject(AuthTokenService);
  const navState = inject(NavigationStateService);

  if (tokenService.isAuthenticated()) {
    return true;
  }

  if (state.url) {
    navState.setLastRoute(state.url);
  }

  return router.createUrlTree(['/login']);
};
