import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthTokenService } from '../storage';

/**
 * Guard de redirecionamento de login
 * Se usuário já está autenticado, redireciona para dashboard
 * Usado na rota /login para evitar que usuário logado acesse a tela de login
 */
export const loginRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const tokenService = inject(AuthTokenService);
  if (tokenService.isAuthenticated()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
