import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { ApiService } from '../../../api-services/api-sevice';
import { VeterinarioModel } from '../../../components/models/veterinario-model';
import { Page } from '../../../components/models/page';

@Injectable({ providedIn: 'root' })
export class VeterinarioService extends ApiService {
  private readonly endpoint = 'veterinarios';

  constructor(http: HttpClient) {
    super(http);
  }

  listar(page: number, size: number): Observable<Page<VeterinarioModel>> {
    return this.get<Page<VeterinarioModel>>(`${this.endpoint}?page=${page}&size=${size}`);
  }

  buscarPorId(id: number): Observable<VeterinarioModel> {
    return this.get<VeterinarioModel>(`${this.endpoint}/${id}`);
  }

  salvar(dto: VeterinarioModel): Observable<VeterinarioModel> {
    return this.post<VeterinarioModel>(this.endpoint, dto);
  }

  atualizar(dto: VeterinarioModel): Observable<VeterinarioModel> {
    return this.put<VeterinarioModel>(`${this.endpoint}/${dto.id}`, dto);
  }

  deletar(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }
}
