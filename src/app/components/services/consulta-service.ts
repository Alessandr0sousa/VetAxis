import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../api-services/api-sevice';

export interface ConsultaModel {
  id?: number;
  anamnese?: string;
  exameFisico?: string;
  tratamento?: string;
  prescricao?: string;
  diagnostico?: string;
  internamento?: boolean;
  status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ConsultaService extends ApiService {
  private endpoint = 'agendamentos/consultas';

  /**
   * Criar nova consulta
   * POST /agendamentos/consultas
   */
  criar(consulta: ConsultaModel): Observable<ConsultaModel> {
    console.log('ConsultaService - Enviando payload:', consulta);
    return this.post<ConsultaModel>(this.endpoint, consulta);
  }

  /**
   * Atualizar consulta existente
   * PUT /agendamentos/consultas/{id}
   */
  atualizar(id: number, consulta: ConsultaModel): Observable<ConsultaModel> {
    return this.put<ConsultaModel>(`${this.endpoint}/${id}`, consulta);
  }

  /**
   * Buscar consulta por ID
   * GET /agendamentos/consultas/{id}
   */
  buscarPorId(id: number): Observable<ConsultaModel> {
    return this.get<ConsultaModel>(`${this.endpoint}/${id}`);
  }

  /**
   * Deletar consulta
   * DELETE /agendamentos/consultas/{id}
   */
  deletar(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
