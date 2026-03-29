import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { NoReuseStrategy } from './no-reuse-strategy';
import { RouteReuseStrategy } from '@angular/router';
import { authInterceptor } from '@infrastructure/interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    { provide: RouteReuseStrategy, useClass: NoReuseStrategy }
  ]
};
