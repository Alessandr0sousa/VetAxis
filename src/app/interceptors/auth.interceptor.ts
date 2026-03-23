import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthTokenService, UserProfileService } from '@infrastructure/storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const tokenService = inject(AuthTokenService);
  const userProfileService = inject(UserProfileService);
  const token = tokenService.getToken();
  const isLoginRequest = req.url.includes('/login');

  const redirectToLogin = () => {
    tokenService.clearToken();
    userProfileService.clearUserProfile();
    if (router.url !== '/login') {
      void router.navigate(['/login'], { replaceUrl: true });
    }
  };

  const onError = (error: any) => {
    if (error?.status === 401) {
      redirectToLogin();
    }

    console.error('HTTP Error:', error.status, error.message);
    return throwError(() => error);
  };

  // Skip token injection for login requests or when token is not available
  if (isLoginRequest || !token) {
    return next(req).pipe(catchError(onError));
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
  return next(clonedRequest).pipe(catchError(onError));
};
