import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './../../api-services/api-sevice';
import { Observable } from 'rxjs';
import { FuncionarioModel } from '../models/funcionario-model';
import { Page } from '../models/page';

@Injectable({
  providedIn: 'root',
})
export class FuncionarioService extends ApiService {
  private readonly endpoint = 'funcionarios';

  constructor(http: HttpClient) {
    super(http);
  }

  // Listar todos com paginação
  listar(page: number, size: number): Observable<Page<FuncionarioModel>> {
    return this.get<Page<FuncionarioModel>>(`${this.endpoint}?page=${page}&size=${size}`);
  }

  // Buscar por ID
  buscarPorId(id: number): Observable<FuncionarioModel> {
    return this.get<FuncionarioModel>(`${this.endpoint}/${id}`);
  }

  // Criar novo funcionario
  salvar(dto: FuncionarioModel): Observable<FuncionarioModel> {
    return this.post<FuncionarioModel>(this.endpoint, dto);
  }

  // Atualizar funcionario
  atualizar(dto: FuncionarioModel): Observable<FuncionarioModel> {
    return this.put<FuncionarioModel>(`${this.endpoint}/${dto.id}`, dto);
  }

  // Deletar funcionario
  deletar(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
