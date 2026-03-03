import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../api-services/api-sevice';

export interface CirurgiaModel {
  id?: number;
  tipo?: string;
  descricao?: string;
  anestesia?: string;
  protocoloAnestesia?: string;
  relaProcedimento?: string;
  internamento?: boolean;
  statusCirurgia?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CirurgiaService extends ApiService {
  private endpoint = 'agendamentos/cirurgias';

  /**
   * Criar nova cirurgia
   * POST /agendamentos/cirurgias
   */
  criar(cirurgia: CirurgiaModel): Observable<CirurgiaModel> {
    console.log('CirurgiaService - Enviando payload:', cirurgia);
    return this.post<CirurgiaModel>(this.endpoint, cirurgia);
  }

  /**
   * Atualizar cirurgia existente
   * PUT /agendamentos/cirurgias/{id}
   */
  atualizar(id: number, cirurgia: CirurgiaModel): Observable<CirurgiaModel> {
    return this.put<CirurgiaModel>(`${this.endpoint}/${id}`, cirurgia);
  }

  /**
   * Buscar cirurgia por ID
   * GET /agendamentos/cirurgias/{id}
   */
  buscarPorId(id: number): Observable<CirurgiaModel> {
    return this.get<CirurgiaModel>(`${this.endpoint}/${id}`);
  }

  /**
   * Deletar cirurgia
   * DELETE /agendamentos/cirurgias/{id}
   */
  deletar(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
