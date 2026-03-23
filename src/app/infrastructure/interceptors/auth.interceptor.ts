import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthTokenService, UserProfileService } from '../storage';

/**
 * Interceptor HTTP para autenticação
 *
 * Responsabilidades:
 * - Adiciona token JWT em todas as requisições (exceto /login)
 * - Verifica validade do token antes de enviar
 * - Trata erros 401 (Unauthorized) redirecionando para login
 * - Limpa dados de autenticação em caso de falha
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenService = inject(AuthTokenService);
  const userProfileService = inject(UserProfileService);

  const token = tokenService.getToken();
  const isLoginRequest = req.url.includes('/login');

  /**
   * Redireciona usuário para login e limpa autenticação
   */
  const redirectToLogin = () => {
    console.warn('🔒 Sessão inválida - Limpando autenticação');
    tokenService.clearToken();
    userProfileService.clearUserProfile();

    if (router.url !== '/login') {
      void router.navigate(['/login'], { replaceUrl: true });
    }
  };

  /**
   * Handler de erros HTTP
   */
  const onError = (error: any) => {
    if (error?.status === 401) {
      console.error('❌ HTTP 401 - Token inválido ou expirado');
      redirectToLogin();
    } else {
      console.error('❌ HTTP Error:', error.status, error.message);
    }

    return throwError(() => error);
  };

  // Skip token injection para requests de login ou quando token não existe
  if (isLoginRequest || !token) {
    return next(req).pipe(catchError(onError));
  }

  // Verifica validade do token antes de enviar
  if (!tokenService.isTokenValid()) {
    console.warn('⚠️ Token expirado - Redirecionando para login');
    redirectToLogin();
    return throwError(() => new Error('Token expirado ou inválido'));
  }

  // Clona request e adiciona header Authorization
  const clonedRequest = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });

  // Processa request e trata erros
  return next(clonedRequest).pipe(catchError(onError));
};
