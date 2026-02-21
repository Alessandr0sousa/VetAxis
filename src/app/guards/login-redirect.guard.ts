import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthTokenService } from '../components/services/auth-token-service';
import { NavigationStateService } from '../components/services/navigation-state-service';

export const loginRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const tokenService = inject(AuthTokenService);
  const navState = inject(NavigationStateService);

  if (tokenService.isAuthenticated()) {
    const target = navState.getLastRoute() ?? '/dashboard';
    return router.createUrlTree([target]);
  }

  return true;
};
