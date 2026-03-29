import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { ApiService } from '../../../api-services/api-sevice';

export type EscalaVeterinariosPayload = {
  mes: number;
  ano: number;
  veterinarioId: number;
  clinicaId: number;
  dias: { dia: number; horarios: { horaInicio: string; horaFim: string }[] }[];
};

export type EscalaVeterinariosItem = {
  id: number;
  nome: string;
  mes: number;
  ano: number;
  dia: number;
  horaInicio: string;
  horaFim: string;
  veterinarioId: number;
  clinicaId: number;
};

export type EscalaVeterinariosResponse = {
  content: EscalaVeterinariosItem[];
};

@Injectable({
  providedIn: 'root',
})
export class EscalaVeterinariosService extends ApiService {
  private endpoint = 'escala-veterinarios';

  constructor(http: HttpClient) {
    super(http);
  }

  salvar(payload: EscalaVeterinariosPayload): Observable<void> {
    const veterinarioId = Number(payload?.veterinarioId);
    const clinicaId = Number(payload?.clinicaId);

    if (!Number.isFinite(veterinarioId) || veterinarioId <= 0) {
      return throwError(() => new Error('ID do veterinário é obrigatório'));
    }

    if (!Number.isFinite(clinicaId) || clinicaId <= 0) {
      return throwError(() => new Error('ID da clínica é obrigatório'));
    }

    return this.post<void>(`${this.endpoint}/lote`, {
      ...payload,
      veterinarioId,
      clinicaId,
    });
  }

  buscar(
    ano: number,
    mes: number,
    clinicaId: number,
    page = 0,
    size = 200,
  ): Observable<EscalaVeterinariosResponse> {
    return this.get<EscalaVeterinariosResponse>(`${this.endpoint}/filtrar`, {
      ano,
      mes,
      'clinica.id': clinicaId,
      page,
      size,
    });
  }

  buscarPorVeterinario(
    veterinarioId: number,
    clinicaId: number,
    page = 0,
    size = 500,
  ): Observable<EscalaVeterinariosResponse> {
    return this.get<EscalaVeterinariosResponse>(`${this.endpoint}/filtrar`, {
      'veterinario.id': veterinarioId,
      'clinica.id': clinicaId,
      page,
      size,
    });
  }
}
