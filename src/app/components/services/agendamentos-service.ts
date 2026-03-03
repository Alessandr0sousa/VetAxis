import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../api-services/api-sevice';
import { Page } from '../models/page';
import { ConsultasFormAgendamentosModel } from '../models/consultas-form-agendametos-model';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { TipoAgendamento, AgendamentosAgrupados } from '../models/agendamentos-model';
import { ConsultaService } from './consulta-service';
import { ExameService } from './exame-service';
import { CirurgiaService } from './cirurgia-service';
import { VacinaService } from './vacina-service';

@Injectable({
  providedIn: 'root',
})
export class AgendamentosService extends ApiService {
  private endpoint = 'agendamentos';

  // Services específicos para cada tipo
  private consultaService = inject(ConsultaService);
  private exameService = inject(ExameService);
  private cirurgiaService = inject(CirurgiaService);
  private vacinaService = inject(VacinaService);

  // BehaviorSubject para manter a lista em memória e emitir atualizações
  private agendamentosSource = new BehaviorSubject<ConsultasFormAgendamentosModel[]>([]);
  agendamentos$ = this.agendamentosSource.asObservable();

  // BehaviorSubject para dados agrupados por tipo
  private agendamentosAgrupadosSource = new BehaviorSubject<AgendamentosAgrupados>({
    consultas: [],
    cirurgias: [],
    exames: [],
    vacinas: [],
    totalConsultas: 0,
    totalCirurgias: 0,
    totalExames: 0,
    totalVacinas: 0,
    total: 0,
  });
  agendamentosAgrupados$ = this.agendamentosAgrupadosSource.asObservable();

  constructor(http: HttpClient) {
    super(http);
  }

  private normalizarPayload(
    agendamento: ConsultasFormAgendamentosModel,
  ): ConsultasFormAgendamentosModel {
    const veterinarioIdRaw =
      (agendamento as any)?.veterinario?.id ?? (agendamento as any)?.veterinarioId;
    const petIdRaw = (agendamento as any)?.pet?.id ?? (agendamento as any)?.petId;

    const veterinarioId = Number(veterinarioIdRaw);
    const petId = Number(petIdRaw);

    if (!Number.isFinite(veterinarioId) || veterinarioId <= 0) {
      throw new Error('ID do veterinário é obrigatório');
    }

    if (!Number.isFinite(petId) || petId <= 0) {
      throw new Error('ID do pet é obrigatório');
    }

    // Validação condicional: consultaOrigemId obrigatório apenas quando isRetorno = true
    if ((agendamento as any)?.isRetorno === true) {
      const consultaOrigemIdRaw =
        (agendamento as any)?.consultaOrigem?.id ?? (agendamento as any)?.consultaOrigemId;
      const consultaOrigemId = Number(consultaOrigemIdRaw);

      if (!Number.isFinite(consultaOrigemId) || consultaOrigemId <= 0) {
        throw new Error('ID da consulta de origem é obrigatório para retorno');
      }
    }

    const payload: ConsultasFormAgendamentosModel = {
      ...agendamento,
      veterinario: { id: veterinarioId } as any,
      pet: { id: petId } as any,
      ...( { veterinarioId, petId } as any ),
    };

    delete (payload as any).veterinarioNome;
    delete (payload as any).petNome;

    return payload;
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

  /**
   * Lista agendamentos agrupados por tipo retornados pelo backend
   * GET /agendamentos retorna: { consultas: [], cirurgias: [], exames: [], vacinas: [], totalConsultas, ... }
   */
  listarAgrupado(): Observable<AgendamentosAgrupados> {
    return this.get<AgendamentosAgrupados>(this.endpoint).pipe(
      tap((data) => {
        // Atualizar BehaviorSubject de dados agrupados
        this.agendamentosAgrupadosSource.next(data);

        // Também atualizar a lista flat para compatibilidade com subscribers existentes
        const listaFlat = [
          ...data.consultas,
          ...data.cirurgias,
          ...data.exames,
          ...data.vacinas,
        ];
        this.agendamentosSource.next(listaFlat);
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

  /**
   * Busca agendamentos por campo com resposta agrupada por tipo
   * Espera que GET /agendamentos/buscar retorne AgendamentosAgrupados
   */
  buscarPorCampoAgrupado(params: {
    campo: string;
    valor: string;
    sort?: { field: string; direction: 'asc' | 'desc' }[];
  }): Observable<AgendamentosAgrupados> {
    let httpParams = new HttpParams()
      .set('campo', params.campo)
      .set('valor', params.valor);

    params.sort?.forEach((s) => {
      httpParams = httpParams.append('sort', `${s.field},${s.direction}`);
    });

    return this.get<AgendamentosAgrupados>(
      `${this.endpoint}/buscar`,
      httpParams,
    ).pipe(
      tap((data) => {
        // Atualizar BehaviorSubject de dados agrupados
        this.agendamentosAgrupadosSource.next(data);

        // Também atualizar a lista flat para compatibilidade
        const listaFlat = [
          ...data.consultas,
          ...data.cirurgias,
          ...data.exames,
          ...data.vacinas,
        ];
        this.agendamentosSource.next(listaFlat);
      }),
    );
  }

  buscarPorId(id: number): Observable<ConsultasFormAgendamentosModel> {
    return this.get<ConsultasFormAgendamentosModel>(`${this.endpoint}/${id}`);
  }

  /**
   * Salvar consulta
   * Fluxo: 1. Criar registro específico de consulta (ConsultaService)
   *        2. Criar agendamento base com referência ao ID da consulta
   */
  salvarConsulta(consulta: ConsultasFormAgendamentosModel): Observable<ConsultasFormAgendamentosModel> {
    try {
      // Validar IDs obrigatórios
      const veterinarioIdRaw = (consulta as any)?.veterinario?.id ?? (consulta as any)?.veterinarioId;
      const petIdRaw = (consulta as any)?.pet?.id ?? (consulta as any)?.petId;

      console.log('AgendamentosService.salvarConsulta - Validando IDs:', { veterinarioIdRaw, petIdRaw });

      const veterinarioId = Number(veterinarioIdRaw);
      const petId = Number(petIdRaw);

      if (!Number.isFinite(veterinarioId) || veterinarioId <= 0) {
        throw new Error(`ID do veterinário é obrigatório (recebido: "${veterinarioIdRaw}")`);
      }

      if (!Number.isFinite(petId) || petId <= 0) {
        throw new Error(`ID do pet é obrigatório (recebido: "${petIdRaw}")`);
      }

      // Extrair dados completos conforme esperado pelo backend
      // Campos básicos + campos específicos da consulta
      const tipoPayload = {
        nome: (consulta as any)?.nome,
        veterinarioId: veterinarioId,
        petId: petId,
        dia: (consulta as any)?.dia,
        horario: (consulta as any)?.horario,
        peso: (consulta as any)?.peso,
        isRetorno: (consulta as any)?.isRetorno ?? false,
        consultaOrigemId: (consulta as any)?.consultaOrigemId ?? null,
        // Campos específicos da consulta (do subgrupo form.consulta)
        anamnese: (consulta as any)?.consulta?.anamnese ?? '',
        exameFisico: (consulta as any)?.consulta?.exameFisico ?? '',
        diagnostico: (consulta as any)?.consulta?.diagnostico ?? '',
        tratamento: (consulta as any)?.consulta?.tratamento ?? '',
        prescricao: (consulta as any)?.consulta?.prescricao ?? '',
        internamento: (consulta as any)?.consulta?.internamento ?? false,
        status: (consulta as any)?.consulta?.status ?? 'AGENDADA',
      };

      console.log('AgendamentosService.salvarConsulta - Payload para POST /agendamentos/consultas:', tipoPayload);

      // Passo 1: Criar consulta usando ConsultaService
      console.log('AgendamentosService - Iniciando POST /agendamentos/consultas');

      return this.consultaService.criar(tipoPayload).pipe(
        // Passo 2: Criar agendamento base com ID da consulta criada
        switchMap((consultaCriada) => {
          console.log('AgendamentosService - Consulta criada, ID:', consultaCriada.id);

          const agendamentoPayload = {
            nome: (consulta as any)?.nome,
            veterinario: { id: veterinarioId } as any,
            veterinarioId: veterinarioId,
            pet: { id: petId } as any,
            petId: petId,
            clinicaId: (consulta as any)?.clinicaId,
            dia: (consulta as any)?.dia,
            horario: (consulta as any)?.horario,
            peso: (consulta as any)?.peso,
            tipoAgendamento: TipoAgendamento.CONSULTA,
            isRetorno: (consulta as any)?.isRetorno ?? false,
            consultaId: consultaCriada.id,
            ...(((consulta as any)?.isRetorno && (consulta as any)?.consultaOrigemId)
              ? { consultaOrigemId: (consulta as any)?.consultaOrigemId }
              : {}),
          };

          console.log('AgendamentosService - Criando agendamento com consultaId:', consultaCriada.id);
          return this.post<ConsultasFormAgendamentosModel>(this.endpoint, agendamentoPayload);
        }),
        tap((agendamentoCriado) => {
          const listaAtual = this.agendamentosSource.value;
          this.agendamentosSource.next([...listaAtual, agendamentoCriado]);
          console.log('AgendamentosService - Agendamento criado com sucesso, ID:', agendamentoCriado.id);
        }),
        catchError((error) => {
          console.error('❌ AgendamentosService.salvarConsulta - ERRO AO CRIAR CONSULTA:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message,
            errorBody: error.error,
            tipoPayload: tipoPayload,
          });

          if (error.status === 403) {
            return throwError(() => new Error('❌ Erro 403 Forbidden: Você não tem permissão para criar consultas. Verifique suas permissões no sistema.'));
          }
          if (error.status === 401) {
            return throwError(() => new Error('❌ Erro 401 Unauthorized: Sessão expirada. Por favor, faça login novamente.'));
          }
          return throwError(() => error);
        }),
      );
    } catch (error) {
      console.error('AgendamentosService.salvarConsulta - Erro na validação:', error);
      return throwError(() => (error instanceof Error ? error : new Error('Erro ao validar dados da consulta')));
    }
  }

  /**
   * Salvar cirurgia
   * Fluxo: 1. Criar registro específico de cirurgia (CirurgiaService)
   *        2. Criar agendamento base com referência ao ID da cirurgia
   */
  salvarCirurgia(cirurgia: ConsultasFormAgendamentosModel): Observable<ConsultasFormAgendamentosModel> {
    try {
      // Validar IDs obrigatórios
      const veterinarioIdRaw = (cirurgia as any)?.veterinario?.id ?? (cirurgia as any)?.veterinarioId;
      const petIdRaw = (cirurgia as any)?.pet?.id ?? (cirurgia as any)?.petId;

      console.log('AgendamentosService.salvarCirurgia - Validando IDs:', { veterinarioIdRaw, petIdRaw });

      const veterinarioId = Number(veterinarioIdRaw);
      const petId = Number(petIdRaw);

      if (!Number.isFinite(veterinarioId) || veterinarioId <= 0) {
        throw new Error(`ID do veterinário é obrigatório (recebido: "${veterinarioIdRaw}")`);
      }

      if (!Number.isFinite(petId) || petId <= 0) {
        throw new Error(`ID do pet é obrigatório (recebido: "${petIdRaw}")`);
      }

      // Extrair dados completos conforme esperado pelo backend
      // Campos básicos + campos específicos da cirurgia
      const tipoPayload = {
        nome: (cirurgia as any)?.nome,
        veterinarioId: veterinarioId,
        petId: petId,
        dia: (cirurgia as any)?.dia,
        horario: (cirurgia as any)?.horario,
        peso: (cirurgia as any)?.peso,
        isRetorno: (cirurgia as any)?.isRetorno ?? false,
        consultaOrigemId: (cirurgia as any)?.consultaOrigemId ?? null,
        // Campos específicos da cirurgia (do subgrupo form.cirurgia)
        tipo: (cirurgia as any)?.cirurgia?.tipo ?? '',
        anestesia: (cirurgia as any)?.cirurgia?.anestesia ?? '',
        protocoloAnestesia: (cirurgia as any)?.cirurgia?.protocoloAnestesia ?? '',
        procedimento: (cirurgia as any)?.cirurgia?.procedimento ?? '',
        status: (cirurgia as any)?.cirurgia?.status ?? 'AGENDADA',
      };

      console.log('AgendamentosService.salvarCirurgia - Payload para POST /agendamentos/cirurgias:', tipoPayload);

      // Passo 1: Criar cirurgia usando CirurgiaService
      console.log('AgendamentosService - Iniciando POST /agendamentos/cirurgias');

      return this.cirurgiaService.criar(tipoPayload).pipe(
        // Passo 2: Criar agendamento base com ID da cirurgia criada
        switchMap((cirurgiaCriada) => {
          console.log('AgendamentosService - Cirurgia criada, ID:', cirurgiaCriada.id);

          const agendamentoPayload = {
            nome: (cirurgia as any)?.nome,
            veterinario: { id: veterinarioId } as any,
            veterinarioId: veterinarioId,
            pet: { id: petId } as any,
            petId: petId,
            clinicaId: (cirurgia as any)?.clinicaId,
            dia: (cirurgia as any)?.dia,
            horario: (cirurgia as any)?.horario,
            peso: (cirurgia as any)?.peso,
            tipoAgendamento: TipoAgendamento.CIRURGIA,
            isRetorno: (cirurgia as any)?.isRetorno ?? false,
            cirurgiaId: cirurgiaCriada.id,
            ...(((cirurgia as any)?.isRetorno && (cirurgia as any)?.consultaOrigemId)
              ? { consultaOrigemId: (cirurgia as any)?.consultaOrigemId }
              : {}),
          };

          console.log('AgendamentosService - Criando agendamento com cirurgiaId:', cirurgiaCriada.id);
          return this.post<ConsultasFormAgendamentosModel>(this.endpoint, agendamentoPayload);
        }),
        tap((agendamentoCriado) => {
          const listaAtual = this.agendamentosSource.value;
          this.agendamentosSource.next([...listaAtual, agendamentoCriado]);
          console.log('AgendamentosService - Agendamento criado com sucesso, ID:', agendamentoCriado.id);
        }),
        catchError((error) => {
          console.error('❌ AgendamentosService.salvarCirurgia - ERRO AO CRIAR CIRURGIA:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message,
            errorBody: error.error,
            tipoPayload: tipoPayload,
          });

          if (error.status === 403) {
            return throwError(() => new Error('❌ Erro 403 Forbidden: Você não tem permissão para criar cirurgias. Verifique suas permissões no sistema.'));
          }
          if (error.status === 401) {
            return throwError(() => new Error('❌ Erro 401 Unauthorized: Sessão expirada. Por favor, faça login novamente.'));
          }
          return throwError(() => error);
        }),
      );
    } catch (error) {
      console.error('AgendamentosService.salvarCirurgia - Erro na validação:', error);
      return throwError(() => (error instanceof Error ? error : new Error('Erro ao validar dados da cirurgia')));
    }
  }

  /**
   * Salvar exame
   * Fluxo: 1. Criar registro específico de exame (ExameService)
   *        2. Criar agendamento base com referência ao ID do exame
   */
  salvarExame(exame: ConsultasFormAgendamentosModel): Observable<ConsultasFormAgendamentosModel> {
    try {
      // Validar IDs obrigatórios
      const veterinarioIdRaw = (exame as any)?.veterinario?.id ?? (exame as any)?.veterinarioId;
      const petIdRaw = (exame as any)?.pet?.id ?? (exame as any)?.petId;

      console.log('AgendamentosService.salvarExame - Validando IDs:', { veterinarioIdRaw, petIdRaw });

      const veterinarioId = Number(veterinarioIdRaw);
      const petId = Number(petIdRaw);

      if (!Number.isFinite(veterinarioId) || veterinarioId <= 0) {
        throw new Error(`ID do veterinário é obrigatório (recebido: "${veterinarioIdRaw}")`);
      }

      if (!Number.isFinite(petId) || petId <= 0) {
        throw new Error(`ID do pet é obrigatório (recebido: "${petIdRaw}")`);
      }

      // Extrair dados completos conforme esperado pelo backend
      // Campos básicos + campos específicos do exame
      const tipoPayload = {
        nome: (exame as any)?.nome,
        veterinarioId: veterinarioId,
        petId: petId,
        dia: (exame as any)?.dia,
        horario: (exame as any)?.horario,
        peso: (exame as any)?.peso,
        isRetorno: (exame as any)?.isRetorno ?? false,
        consultaOrigemId: (exame as any)?.consultaOrigemId ?? null,
        // Campos específicos do exame (do subgrupo form.exame)
        tipo: (exame as any)?.exame?.tipo ?? '',
        descricao: (exame as any)?.exame?.descricao ?? '',
        materialColetado: (exame as any)?.exame?.materialColetado ?? '',
        resultadoEsperado: (exame as any)?.exame?.resultadoEsperado ?? '',
        status: (exame as any)?.exame?.status ?? 'AGENDADA',
      };

      console.log('AgendamentosService.salvarExame - Payload para POST /agendamentos/exames:', tipoPayload);

      // Passo 1: Criar exame usando ExameService
      console.log('AgendamentosService - Iniciando POST /agendamentos/exames');

      return this.exameService.criar(tipoPayload).pipe(
        // Passo 2: Criar agendamento base com ID do exame criado
        switchMap((exameCriado) => {
          console.log('AgendamentosService - Exame criado, ID:', exameCriado.id);

          const agendamentoPayload = {
            nome: (exame as any)?.nome,
            veterinario: { id: veterinarioId } as any,
            veterinarioId: veterinarioId,
            pet: { id: petId } as any,
            petId: petId,
            clinicaId: (exame as any)?.clinicaId,
            dia: (exame as any)?.dia,
            horario: (exame as any)?.horario,
            peso: (exame as any)?.peso,
            tipoAgendamento: TipoAgendamento.EXAME,
            isRetorno: (exame as any)?.isRetorno ?? false,
            exameId: exameCriado.id,
            ...(((exame as any)?.isRetorno && (exame as any)?.consultaOrigemId)
              ? { consultaOrigemId: (exame as any)?.consultaOrigemId }
              : {}),
          };

          console.log('AgendamentosService - Criando agendamento com exameId:', exameCriado.id);
          return this.post<ConsultasFormAgendamentosModel>(this.endpoint, agendamentoPayload);
        }),
        tap((agendamentoCriado) => {
          const listaAtual = this.agendamentosSource.value;
          this.agendamentosSource.next([...listaAtual, agendamentoCriado]);
          console.log('AgendamentosService - Agendamento criado com sucesso, ID:', agendamentoCriado.id);
        }),
        catchError((error) => {
          console.error('❌ AgendamentosService.salvarExame - ERRO AO CRIAR EXAME:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message,
            errorBody: error.error,
            tipoPayload: tipoPayload,
          });

          if (error.status === 403) {
            return throwError(() => new Error('❌ Erro 403 Forbidden: Você não tem permissão para criar exames. Verifique suas permissões no sistema.'));
          }
          if (error.status === 401) {
            return throwError(() => new Error('❌ Erro 401 Unauthorized: Sessão expirada. Por favor, faça login novamente.'));
          }
          return throwError(() => error);
        }),
      );
    } catch (error) {
      console.error('AgendamentosService.salvarExame - Erro na validação:', error);
      return throwError(() => (error instanceof Error ? error : new Error('Erro ao validar dados do exame')));
    }
  }

  /**
   * Salvar vacina
   * Fluxo: 1. Criar registro específico de vacina (VacinaService)
   *        2. Criar agendamento base com referência ao ID da vacina
   */
  salvarVacina(vacina: ConsultasFormAgendamentosModel): Observable<ConsultasFormAgendamentosModel> {
    try {
      // Validar IDs obrigatórios
      const veterinarioIdRaw = (vacina as any)?.veterinario?.id ?? (vacina as any)?.veterinarioId;
      const petIdRaw = (vacina as any)?.pet?.id ?? (vacina as any)?.petId;

      console.log('AgendamentosService.salvarVacina - Validando IDs:', { veterinarioIdRaw, petIdRaw });

      const veterinarioId = Number(veterinarioIdRaw);
      const petId = Number(petIdRaw);

      if (!Number.isFinite(veterinarioId) || veterinarioId <= 0) {
        throw new Error(`ID do veterinário é obrigatório (recebido: "${veterinarioIdRaw}")`);
      }

      if (!Number.isFinite(petId) || petId <= 0) {
        throw new Error(`ID do pet é obrigatório (recebido: "${petIdRaw}")`);
      }

      // Extrair dados completos conforme esperado pelo backend
      // Campos básicos + campos específicos da vacina
      const tipoPayload = {
        nome: (vacina as any)?.nome,
        veterinarioId: veterinarioId,
        petId: petId,
        dia: (vacina as any)?.dia,
        horario: (vacina as any)?.horario,
        peso: (vacina as any)?.peso,
        isRetorno: (vacina as any)?.isRetorno ?? false,
        consultaOrigemId: (vacina as any)?.consultaOrigemId ?? null,
        // Campos específicos da vacina (do subgrupo form.vacina)
        tipo: (vacina as any)?.vacina?.tipo ?? '',
        fabricante: (vacina as any)?.vacina?.fabricante ?? '',
        lote: (vacina as any)?.vacina?.lote ?? '',
        dataValidade: (vacina as any)?.vacina?.dataValidade ?? null,
        status: (vacina as any)?.vacina?.status ?? 'AGENDADA',
      };

      console.log('AgendamentosService.salvarVacina - Payload para POST /agendamentos/vacinas:', tipoPayload);

      // Passo 1: Criar vacina usando VacinaService
      console.log('AgendamentosService - Iniciando POST /agendamentos/vacinas');

      return this.vacinaService.criar(tipoPayload).pipe(
        // Passo 2: Criar agendamento base com ID da vacina criada
        switchMap((vacinaCriada) => {
          console.log('AgendamentosService - Vacina criada, ID:', vacinaCriada.id);

          const agendamentoPayload = {
            nome: (vacina as any)?.nome,
            veterinario: { id: veterinarioId } as any,
            veterinarioId: veterinarioId,
            pet: { id: petId } as any,
            petId: petId,
            clinicaId: (vacina as any)?.clinicaId,
            dia: (vacina as any)?.dia,
            horario: (vacina as any)?.horario,
            peso: (vacina as any)?.peso,
            tipoAgendamento: TipoAgendamento.VACINA,
            isRetorno: (vacina as any)?.isRetorno ?? false,
            vacinaId: vacinaCriada.id,
            ...(((vacina as any)?.isRetorno && (vacina as any)?.consultaOrigemId)
              ? { consultaOrigemId: (vacina as any)?.consultaOrigemId }
              : {}),
          };

          console.log('AgendamentosService - Criando agendamento com vacinaId:', vacinaCriada.id);
          return this.post<ConsultasFormAgendamentosModel>(this.endpoint, agendamentoPayload);
        }),
        tap((agendamentoCriado) => {
          const listaAtual = this.agendamentosSource.value;
          this.agendamentosSource.next([...listaAtual, agendamentoCriado]);
          console.log('AgendamentosService - Agendamento criado com sucesso, ID:', agendamentoCriado.id);
        }),
        catchError((error) => {
          console.error('❌ AgendamentosService.salvarVacina - ERRO AO CRIAR VACINA:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            message: error.message,
            errorBody: error.error,
            tipoPayload: tipoPayload,
          });

          if (error.status === 403) {
            return throwError(() => new Error('❌ Erro 403 Forbidden: Você não tem permissão para criar vacinas. Verifique suas permissões no sistema.'));
          }
          if (error.status === 401) {
            return throwError(() => new Error('❌ Erro 401 Unauthorized: Sessão expirada. Por favor, faça login novamente.'));
          }
          return throwError(() => error);
        }),
      );
    } catch (error) {
      console.error('AgendamentosService.salvarVacina - Erro na validação:', error);
      return throwError(() => (error instanceof Error ? error : new Error('Erro ao validar dados da vacina')));
    }
  }

  /**
   * Atualizar consulta
   * PUT /agendamentos/consultas/{id}
   */
  atualizarConsulta(
    agendamento: ConsultasFormAgendamentosModel,
  ): Observable<ConsultasFormAgendamentosModel> {
    try {
      const payload = this.normalizarPayload(agendamento);
      return this.put<ConsultasFormAgendamentosModel>(
        `${this.endpoint}/consultas/${payload.id}`,
        payload,
      ).pipe(
        tap((atualizado) => {
          const listaAtual = this.agendamentosSource.value.map((a) =>
            a.id === atualizado.id ? atualizado : a,
          );
          this.agendamentosSource.next(listaAtual);
        }),
      );
    } catch (error) {
      return throwError(() => (error instanceof Error ? error : new Error('Erro ao validar agendamento')));
    }
  }

  /**
   * Atualizar cirurgia
   * PUT /agendamentos/cirurgias/{id}
   */
  atualizarCirurgia(
    agendamento: ConsultasFormAgendamentosModel,
  ): Observable<ConsultasFormAgendamentosModel> {
    try {
      const payload = this.normalizarPayload(agendamento);
      return this.put<ConsultasFormAgendamentosModel>(
        `${this.endpoint}/cirurgias/${payload.id}`,
        payload,
      ).pipe(
        tap((atualizado) => {
          const listaAtual = this.agendamentosSource.value.map((a) =>
            a.id === atualizado.id ? atualizado : a,
          );
          this.agendamentosSource.next(listaAtual);
        }),
      );
    } catch (error) {
      return throwError(() => (error instanceof Error ? error : new Error('Erro ao validar agendamento')));
    }
  }

  /**
   * Atualizar exame
   * PUT /agendamentos/exames/{id}
   */
  atualizarExame(
    agendamento: ConsultasFormAgendamentosModel,
  ): Observable<ConsultasFormAgendamentosModel> {
    try {
      const payload = this.normalizarPayload(agendamento);
      return this.put<ConsultasFormAgendamentosModel>(
        `${this.endpoint}/exames/${payload.id}`,
        payload,
      ).pipe(
        tap((atualizado) => {
          const listaAtual = this.agendamentosSource.value.map((a) =>
            a.id === atualizado.id ? atualizado : a,
          );
          this.agendamentosSource.next(listaAtual);
        }),
      );
    } catch (error) {
      return throwError(() => (error instanceof Error ? error : new Error('Erro ao validar agendamento')));
    }
  }

  /**
   * Atualizar vacina
   * PUT /agendamentos/vacinas/{id}
   */
  atualizarVacina(
    agendamento: ConsultasFormAgendamentosModel,
  ): Observable<ConsultasFormAgendamentosModel> {
    try {
      const payload = this.normalizarPayload(agendamento);
      return this.put<ConsultasFormAgendamentosModel>(
        `${this.endpoint}/vacinas/${payload.id}`,
        payload,
      ).pipe(
        tap((atualizado) => {
          const listaAtual = this.agendamentosSource.value.map((a) =>
            a.id === atualizado.id ? atualizado : a,
          );
          this.agendamentosSource.next(listaAtual);
        }),
      );
    } catch (error) {
      return throwError(() => (error instanceof Error ? error : new Error('Erro ao validar agendamento')));
    }
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
