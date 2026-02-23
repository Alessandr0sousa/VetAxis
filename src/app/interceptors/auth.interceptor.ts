import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthTokenService } from '../components/services/auth-token-service';
import { AutenticacaoService } from '../components/services/autenticacao-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(AuthTokenService);
  const authService = inject(AutenticacaoService);
  const token = tokenService.getToken();
  const isLoginRequest = req.url.includes('/login');

  // Skip token injection for login requests or when token is not available
  if (isLoginRequest || !token) {
    return next(req);
  }

  // Clone request and add Authorization header
  const clonedRequest = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });

  // Handle HTTP errors
  return next(clonedRequest).pipe(
    catchError((error) => {
      // Logout on 401 Unauthorized
      if (error.status === 401) {
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
