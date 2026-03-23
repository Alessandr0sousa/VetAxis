import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
  regiao: {
    id: number;
    sigla: string;
    nome: string;
  };
}

@Injectable({ providedIn: 'root' })
export class IbgeService {
  private apiUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades';

  constructor(private http: HttpClient) {}

  listarEstados(): Observable<Estado[]> {
    return this.http.get<Estado[]>(`${this.apiUrl}/estados`);
  }

  listarMunicipiosPorEstado(estadoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/estados/${estadoId}/municipios`);
  }
}
