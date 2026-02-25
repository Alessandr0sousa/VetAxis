import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from '../../api-services/api-sevice';
import { Page } from '../models/page';
import { ConsultasFormAgendamentosModel } from '../models/consultas-form-agendametos-model';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AgendamentosService extends ApiService {
  private endpoint = 'agendamentos';

  // BehaviorSubject para manter a lista em memória e emitir atualizações
  private agendamentosSource = new BehaviorSubject<ConsultasFormAgendamentosModel[]>([]);
  agendamentos$ = this.agendamentosSource.asObservable();

  constructor(http: HttpClient) {
    super(http);
  }

  listar(page: number, size: number): Observable<Page<ConsultasFormAgendamentosModel>> {
    return this.get<Page<ConsultasFormAgendamentosModel>>(
      `${this.endpoint}?page=${page}&size=${size}&sort=dia,asc&sort=horario,asc`,
    ).pipe(
      tap((data) => {
        this.agendamentosSource.next(data.content ?? []);
      }),
    );
  }

  buscarPorCampo(params: {
    campo: string;
    valor: string;
    page?: number;
    size?: number;
    sort?: { field: string; direction: 'asc' | 'desc' }[];
  }): Observable<Page<ConsultasFormAgendamentosModel>> {
    let httpParams = new HttpParams()
      .set('campo', params.campo)
      .set('valor', params.valor)
      .set('page', params.page ?? 0)
      .set('size', params.size ?? 10);

    params.sort?.forEach((s) => {
      httpParams = httpParams.append('sort', `${s.field},${s.direction}`);
    });

    return this.get<Page<ConsultasFormAgendamentosModel>>(
      `${this.endpoint}/buscar`,
      httpParams,
    ).pipe(
      tap((data) => {
        this.agendamentosSource.next(data.content ?? []);
      }),
    );
  }

  buscarPorId(id: number): Observable<ConsultasFormAgendamentosModel> {
    return this.get<ConsultasFormAgendamentosModel>(`${this.endpoint}/${id}`);
  }

  salvar(agendamento: ConsultasFormAgendamentosModel): Observable<ConsultasFormAgendamentosModel> {
    return this.post<ConsultasFormAgendamentosModel>(this.endpoint, agendamento).pipe(
      tap((novo) => {
        const listaAtual = this.agendamentosSource.value;
        this.agendamentosSource.next([...listaAtual, novo]);
      }),
    );
  }

  atualizar(
    agendamento: ConsultasFormAgendamentosModel,
  ): Observable<ConsultasFormAgendamentosModel> {
    return this.put<ConsultasFormAgendamentosModel>(
      `${this.endpoint}/${agendamento.id}`,
      agendamento,
    ).pipe(
      tap((atualizado) => {
        const listaAtual = this.agendamentosSource.value.map((a) =>
          a.id === atualizado.id ? atualizado : a,
        );
        this.agendamentosSource.next(listaAtual);
      }),
    );
  }

  excluir(id: number): Observable<void> {
    return this.delete<void>(`${this.endpoint}/${id}`).pipe(
      tap(() => {
        const listaAtual = this.agendamentosSource.value.filter((a) => a.id !== id);
        this.agendamentosSource.next(listaAtual);
      }),
    );
  }

  filtrarEscala(params: {
    veterinarioId: number;
    clinicaId: number;
    mes: number;
    ano: number;
  }): Observable<Page<ConsultasFormAgendamentosModel>> {
    let httpParams = new HttpParams()
      .set('veterinarioId', params.veterinarioId.toString())
      .set('clinicaId', params.clinicaId.toString())
      .set('mes', params.mes.toString())
      .set('ano', params.ano.toString());

    return this.get<Page<ConsultasFormAgendamentosModel>>(
      `${this.endpoint}/filtrar`,
      httpParams,
    );
  }
}
