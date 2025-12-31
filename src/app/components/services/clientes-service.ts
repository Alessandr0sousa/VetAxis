import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Cliente } from '../models/cliente';
import { ApiService } from '../../api-services/api-sevice';
import { Page } from '../models/page'; // novo modelo

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  constructor(private api: ApiService) {}

  // ✅ Agora retorna objeto paginado
  listar(page: number = 0, size: number = 10): Observable<Page<Cliente>> {
    return this.api.get<Page<Cliente>>(`clientes?page=${page}&size=${size}`);
  }

  buscarPorId(id: number): Observable<Cliente> {
    return this.api.get<Cliente>(`clientes/${id}`);
  }

  salvar(cliente: Cliente): Observable<Cliente> {
    return this.api.post<Cliente>('clientes', cliente);
  }

  atualizar(cliente: Cliente): Observable<Cliente> {
    return this.api.put<Cliente>(`clientes/${cliente.id}`, cliente);
  }

  excluir(id: number): Observable<void> {
    return this.api.delete<void>(`clientes/${id}`);
  }
}
