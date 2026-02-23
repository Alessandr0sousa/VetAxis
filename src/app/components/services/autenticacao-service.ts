import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from '../../api-services/api-sevice';
import { AuthTokenService } from './auth-token-service';
import { UserProfileService } from './user-profile-service';
import { AuthResponse } from '../../models/auth-response.model';

@Injectable({
  providedIn: 'root',
})
export class AutenticacaoService extends ApiService {
  private readonly endpoint = 'login';
  private readonly tokenService = inject(AuthTokenService);
  private readonly userProfileService = inject(UserProfileService);
  private readonly router = inject(Router);

  constructor(http: HttpClient) {
    super(http);
  }

  autenticar(email: string, senha: string): Observable<AuthResponse> {
    const payload = { login: email, password: senha };
    return this.post<AuthResponse>(this.endpoint, payload);
  }

  logout(): void {
    this.tokenService.clearToken();
    this.userProfileService.clearUserProfile();
    this.router.navigate(['/login']);
  }
}
