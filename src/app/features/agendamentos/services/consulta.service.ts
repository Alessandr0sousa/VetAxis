import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../api-services/api-sevice';

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

  criar(consulta: ConsultaModel): Observable<ConsultaModel> {
    console.log('ConsultaService - Enviando payload:', consulta);
    return this.post<ConsultaModel>(this.endpoint, consulta);
  }

  atualizar(id: number, consulta: ConsultaModel): Observable<ConsultaModel> {
    return this.put<ConsultaModel>(`${this.endpoint}/${id}`, consulta);
  }

  buscarPorId(id: number): Observable<ConsultaModel> {
    return this.get<ConsultaModel>(`${this.endpoint}/${id}`);
  }

  deletar(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
