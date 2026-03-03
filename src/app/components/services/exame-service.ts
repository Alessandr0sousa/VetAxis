import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../api-services/api-sevice';

export interface ExameModel {
  id?: number;
  tipo?: string;
  descricao?: string;
  materialColetado?: string;
  achados?: string;
  laudo?: string;
  statusExame?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExameService extends ApiService {
  private endpoint = 'agendamentos/exames';

  /**
   * Criar novo exame
   * POST /agendamentos/exames
   */
  criar(exame: ExameModel): Observable<ExameModel> {
    console.log('ExameService - Enviando payload:', exame);
    return this.post<ExameModel>(this.endpoint, exame);
  }

  /**
   * Atualizar exame existente
   * PUT /agendamentos/exames/{id}
   */
  atualizar(id: number, exame: ExameModel): Observable<ExameModel> {
    return this.put<ExameModel>(`${this.endpoint}/${id}`, exame);
  }

  /**
   * Buscar exame por ID
   * GET /agendamentos/exames/{id}
   */
  buscarPorId(id: number): Observable<ExameModel> {
    return this.get<ExameModel>(`${this.endpoint}/${id}`);
  }

  /**
   * Deletar exame
   * DELETE /agendamentos/exames/{id}
   */
  deletar(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
