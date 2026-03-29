import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../api-services/api-sevice';
import { FuncionarioModel } from '../../../components/models/funcionario-model';
import { Page } from '../../../components/models/page';

@Injectable({ providedIn: 'root' })
export class FuncionarioService extends ApiService {
  private readonly endpoint = 'funcionarios';

  constructor(http: HttpClient) {
    super(http);
  }

  listar(page: number, size: number): Observable<Page<FuncionarioModel>> {
    return this.get<Page<FuncionarioModel>>(`${this.endpoint}?page=${page}&size=${size}`);
  }

  buscarPorId(id: number): Observable<FuncionarioModel> {
    return this.get<FuncionarioModel>(`${this.endpoint}/${id}`);
  }

  salvar(dto: FuncionarioModel): Observable<FuncionarioModel> {
    return this.post<FuncionarioModel>(this.endpoint, dto);
  }

  atualizar(dto: FuncionarioModel): Observable<FuncionarioModel> {
    return this.put<FuncionarioModel>(`${this.endpoint}/${dto.id}`, dto);
  }

  deletar(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
