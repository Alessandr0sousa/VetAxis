import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../api-services/api-sevice';

export interface VacinaModel {
  id?: number;
  tipo?: string;
  nome?: string;
  lote?: string;
  fabricante?: string;
  dataValidade?: string;
  dose?: string;
  statusVacina?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VacinaService extends ApiService {
  private endpoint = 'agendamentos/vacinas';

  criar(vacina: VacinaModel): Observable<VacinaModel> {
    console.log('VacinaService - Enviando payload:', vacina);
    return this.post<VacinaModel>(this.endpoint, vacina);
  }

  atualizar(id: number, vacina: VacinaModel): Observable<VacinaModel> {
    return this.put<VacinaModel>(`${this.endpoint}/${id}`, vacina);
  }

  buscarPorId(id: number): Observable<VacinaModel> {
    return this.get<VacinaModel>(`${this.endpoint}/${id}`);
  }

  deletar(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
