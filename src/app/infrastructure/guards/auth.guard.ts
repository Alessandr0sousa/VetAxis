import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthTokenService, UserProfileService, NavigationStateService } from '../storage';

/**
 * Guard de autenticação
 * Verifica se usuário tem token e perfil válidos
 * Se não tiver, redireciona para /login preservando a rota tentada
 */
export const authGuard: CanActivateChildFn = (_route, state) => {
  const router = inject(Router);
  const tokenService = inject(AuthTokenService);
  const userProfileService = inject(UserProfileService);
  const navState = inject(NavigationStateService);

  const hasValidToken = tokenService.isTokenValid();
  const hasValidProfile = userProfileService.isProfileValid();

  // Se não tem token válido OU não tem perfil válido, redireciona
  if (!hasValidToken || !hasValidProfile) {
    // Salva rota para redirecionar depois do login
    if (state.url && state.url !== '/login') {
      navState.setLastRoute(state.url);
    }

    console.warn('🔒 Acesso negado - Redirecionando para login');
    return router.createUrlTree(['/login']);
  }

  return true;
};
