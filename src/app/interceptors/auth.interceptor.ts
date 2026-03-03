import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthTokenService } from '../components/services/auth-token-service';
import { UserProfileService } from '../components/services/user-profile-service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenService = inject(AuthTokenService);
  const userProfileService = inject(UserProfileService);
  const token = tokenService.getToken();
  const isLoginRequest = req.url.includes('/login');

  const redirectToLogin = () => {
    tokenService.clearToken();
    userProfileService.clearUserProfile();
    void router.navigate(['/login']);
  };

  // Skip token injection for login requests or when token is not available
  if (isLoginRequest || !token) {
    return next(req);
  }

  if (!tokenService.isTokenValid()) {
    redirectToLogin();
    return throwError(() => new Error('Token expirado ou inválido'));
  }

  // Clone request and add Authorization header
  const clonedRequest = req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`),
  });

  // Handle HTTP errors
  return next(clonedRequest).pipe(
    catchError((error) => {
      if (error?.status === 401 || error?.status === 403) {
        redirectToLogin();
      }

      console.error('HTTP Error:', error.status, error.message);
      return throwError(() => error);
    })
  );
};
