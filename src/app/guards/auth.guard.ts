import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthTokenService } from '../components/services/auth-token-service';
import { UserProfileService } from '../components/services/user-profile-service';
import { NavigationStateService } from '../components/services/navigation-state-service';

export const authGuard: CanActivateChildFn = (_route, state) => {
  const router = inject(Router);
  const tokenService = inject(AuthTokenService);
  const userProfileService = inject(UserProfileService);
  const navState = inject(NavigationStateService);

  const hasValidToken = tokenService.isTokenValid();
  const hasValidProfile = userProfileService.isProfileValid();

  // Se não tem token válido OU não tem perfil válido, redireciona
  if (!hasValidToken || !hasValidProfile) {
    // NÃO limpa dados aqui! Apenas redireciona para login
    // Os dados serão mantidos para possível re-login

    // Salva rota para redirecionar depois do login
    if (state.url && state.url !== '/login') {
      navState.setLastRoute(state.url);
    }

    return router.createUrlTree(['/login']);
  }

  return true;
};
