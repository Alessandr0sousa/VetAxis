import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthTokenService, NavigationStateService } from '../storage';

/**
 * Guard de redirecionamento de login
 * Se usuário já está autenticado, redireciona para última rota ou dashboard
 * Usado na rota /login para evitar que usuário logado acesse a tela de login
 */
export const loginRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const tokenService = inject(AuthTokenService);
  const navState = inject(NavigationStateService);

  if (tokenService.isAuthenticated()) {
    const target = navState.getLastRoute() ?? '/dashboard';
    console.log('✅ Usuário autenticado - Redirecionando para:', target);
    return router.createUrlTree([target]);
  }

  return true;
};
