import { Injectable } from '@angular/core';
import { ApiService } from '../../api-services/api-sevice';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthTokenService } from './auth-token-service';

@Injectable({
  providedIn: 'root',
})
export class AutenticacaoService extends ApiService {
  private endpoint = 'login';

  constructor(
    http: HttpClient,
    private tokenService: AuthTokenService
  ) {
    super(http);
  }

  autenticar(email: string, senha: string): Observable<{ token: string; nome: string }> {
    const payload = { login: email, password: senha };
    return this.post<{ token: string; nome: string }>(this.endpoint, payload);
  }

  logout() {
    this.tokenService.clearToken();
  }
}
