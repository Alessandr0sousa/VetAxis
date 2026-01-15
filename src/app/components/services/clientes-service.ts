import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente';
import { ApiService } from '../../api-services/api-sevice';
import { Page } from '../models/page';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ClientesService extends ApiService {
  private endpoint = 'clientes';

  constructor(http: HttpClient) {
    super(http);
  }

  listar(page: number, size: number): Observable<Page<Cliente>> {
    return this.get<Page<Cliente>>(`${this.endpoint}?page=${page}&size=${size}`);
  }

  buscarPorId(id: number): Observable<Cliente> {
    return this.get<Cliente>(`${this.endpoint}/${id}`);
  }

  salvar(cliente: Cliente): Observable<Cliente> {
    return this.post<Cliente>(this.endpoint, cliente);
  }

  atualizar(cliente: Cliente): Observable<Cliente> {
    return this.put<Cliente>(`${this.endpoint}/${cliente.id}`, cliente);
  }

  excluir(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
