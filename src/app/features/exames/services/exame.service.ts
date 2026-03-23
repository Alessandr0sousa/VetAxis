import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../api-services/api-sevice';

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

  criar(exame: ExameModel): Observable<ExameModel> {
    console.log('ExameService - Enviando payload:', exame);
    return this.post<ExameModel>(this.endpoint, exame);
  }

  atualizar(id: number, exame: ExameModel): Observable<ExameModel> {
    return this.put<ExameModel>(`${this.endpoint}/${id}`, exame);
  }

  buscarPorId(id: number): Observable<ExameModel> {
    return this.get<ExameModel>(`${this.endpoint}/${id}`);
  }

  deletar(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
