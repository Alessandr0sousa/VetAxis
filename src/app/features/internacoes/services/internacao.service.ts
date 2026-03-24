import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../api-services/api-sevice';
import {
  InternacaoAltaRequestDTO,
  InternacaoEvolucaoPageResponse,
  InternacaoEvolucaoRequestDTO,
  InternacaoEvolucaoResponseDTO,
  InternacaoPageResponse,
  InternacaoRequestDTO,
  InternacaoResponseDTO,
  InternacaoStatusRequestDTO,
} from '../models/internacao.dto';

@Injectable({ providedIn: 'root' })
export class InternacaoService extends ApiService {
  private readonly endpoint = 'internacoes';

  constructor(http: HttpClient) {
    super(http);
  }

  admitir(dto: InternacaoRequestDTO): Observable<InternacaoResponseDTO> {
    return this.post<InternacaoResponseDTO>(this.endpoint, dto);
  }

  listar(page = 0, size = 20, sort = 'dataHoraAdmissao,desc'): Observable<InternacaoPageResponse> {
    return this.get<InternacaoPageResponse>(this.endpoint, { page, size, sort });
  }

  detalhar(id: number): Observable<InternacaoResponseDTO> {
    return this.get<InternacaoResponseDTO>(`${this.endpoint}/${id}`);
  }

  atualizar(id: number, dto: InternacaoRequestDTO): Observable<InternacaoResponseDTO> {
    return this.put<InternacaoResponseDTO>(`${this.endpoint}/${id}`, dto);
  }

  remover(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`);
  }

  alterarStatus(id: number, dto: InternacaoStatusRequestDTO): Observable<InternacaoResponseDTO> {
    return this.post<InternacaoResponseDTO>(`${this.endpoint}/${id}/status`, dto);
  }

  darAlta(id: number, dto: InternacaoAltaRequestDTO): Observable<InternacaoResponseDTO> {
    return this.post<InternacaoResponseDTO>(`${this.endpoint}/${id}/alta`, dto);
  }

  registrarEvolucao(id: number, dto: InternacaoEvolucaoRequestDTO): Observable<InternacaoEvolucaoResponseDTO> {
    return this.post<InternacaoEvolucaoResponseDTO>(`${this.endpoint}/${id}/evolucoes`, dto);
  }

  listarEvolucoes(id: number, page = 0, size = 20): Observable<InternacaoEvolucaoPageResponse> {
    return this.get<InternacaoEvolucaoPageResponse>(`${this.endpoint}/${id}/evolucoes`, { page, size });
  }
}
