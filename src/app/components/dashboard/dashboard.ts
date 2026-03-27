import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { AgendamentoCompleto } from '@core/models';
import { AgendamentosService } from '@features/agendamentos';
import { ClientesService } from '@features/clientes';
import {
  InternacaoResponseDTO,
  InternacaoService,
  StatusInternacao,
} from '@features/internacoes';
import { PetService } from '@features/pets';
import { EscalaVeterinariosService, VeterinarioService } from '@features/veterinarios';
import { AlertService } from '@shared/services';
import { Subject, forkJoin, interval } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnDestroy {
  private readonly clientesService = inject(ClientesService);
  private readonly petService = inject(PetService);
  private readonly internacaoService = inject(InternacaoService);
  private readonly agendamentosService = inject(AgendamentosService);
  private readonly veterinarioService = inject(VeterinarioService);
  private readonly escalaService = inject(EscalaVeterinariosService);
  private readonly alertService = inject(AlertService);

  readonly carregando = signal(false);
  readonly hoje = signal(new Date());

  readonly totalClientes = signal(0);
  readonly totalPets = signal(0);
  readonly totalInternados = signal(0);
  readonly totalAgendamentosHoje = signal(0);
  readonly totalConfirmadosHoje = signal(0);

  readonly agendamentosHojeLista = signal<AgendamentoCompleto[]>([]);
  readonly veterinariosDisponiveisHoje = signal<VeterinarioDisponivel[]>([]);

  readonly dataHojeLabel = computed(() => this.hoje().toLocaleDateString('pt-BR'));
  private readonly destroy$ = new Subject<void>();
  private readonly autoRefreshMs = 60000;

  ngOnInit(): void {
    interval(this.autoRefreshMs)
      .pipe(startWith(0), takeUntil(this.destroy$))
      .subscribe(() => {
        this.hoje.set(new Date());
        this.carregarResumo();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  carregarResumo(): void {
    this.carregando.set(true);

    const dataAtual = this.hoje();
    const diaHoje = this.formatarDataPtBr(dataAtual);

    forkJoin({
      clientes: this.clientesService.listar(0, 1),
      pets: this.petService.listar(0, 1),
      internacoes: this.internacaoService.listar(0, 500, 'dataHoraAdmissao,desc'),
      agendamentosHoje: this.agendamentosService.buscarPorCampo({
        campo: 'dia',
        valor: diaHoje,
        page: 0,
        size: 200,
        sort: [
          { field: 'dia', direction: 'asc' },
          { field: 'horario', direction: 'asc' },
        ],
      }),
      veterinarios: this.veterinarioService.listar(0, 300),
      escalaMes: this.escalaService.buscar(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 1, 0, 500),
    }).subscribe({
      next: ({ clientes, pets, internacoes, agendamentosHoje, veterinarios, escalaMes }) => {
        this.totalClientes.set(this.obterTotalElementos(clientes));
        this.totalPets.set(this.obterTotalElementos(pets));
        this.totalInternados.set(this.contarInternacoesAtivas(internacoes.content ?? []));

        const agendaDoDia = agendamentosHoje.content ?? [];
        const agendaDoDiaNormalizada = agendaDoDia.map((item) => ({
          ...item,
          status: this.normalizarStatus(item),
        }));
        const confirmados = this.extrairConfirmados(agendaDoDiaNormalizada);

        this.totalAgendamentosHoje.set(this.obterTotalElementos(agendamentosHoje));
        this.totalConfirmadosHoje.set(confirmados.length);
        this.agendamentosHojeLista.set(agendaDoDiaNormalizada);

        const mapaVeterinarios = new Map(
          (veterinarios.content ?? []).map((vet) => [vet.id, vet]),
        );

        this.veterinariosDisponiveisHoje.set(
          this.extrairVeterinariosDisponiveisHoje(
            escalaMes.content ?? [],
            dataAtual.getDate(),
            mapaVeterinarios,
          ),
        );

        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.alertService.error('Nao foi possivel carregar os dados do dashboard.');
      },
    });
  }

  obterClasseCardStatus(agendamento: AgendamentoCompleto): string {
    const status = this.normalizarStatus(agendamento);

    if (status === 'CANCELADO' || status === 'CANCELADA') {
      return 'status-cancelado';
    }

    if (status === 'REALIZADO' || status === 'CONCLUIDO' || status === 'CONCLUIDA') {
      return 'status-realizado';
    }

    if (status === 'INICIADO' || status === 'EM_ANDAMENTO') {
      return 'status-iniciado';
    }

    if (status === 'CONFIRMADO' || status === 'CONFIRMADA') {
      return 'status-confirmado';
    }

    return 'status-agendado';
  }

  private extrairConfirmados(agendamentos: AgendamentoCompleto[]): AgendamentoCompleto[] {
    return agendamentos.filter((item) => {
      const status = this.normalizarStatus(item);
      return status === 'CONFIRMADO' || status === 'CONFIRMADA';
    });
  }

  private normalizarStatus(item: AgendamentoCompleto): string {
    const statusDireto = String(item.status ?? '').trim();
    if (statusDireto) {
      return statusDireto.toUpperCase();
    }

    const itemAny = item as Record<string, any>;
    const statusAlternativo =
      itemAny['consulta']?.status ??
      itemAny['consulta']?.statusConsulta ??
      itemAny['cirurgia']?.status ??
      itemAny['cirurgia']?.statusCirurgia ??
      itemAny['exame']?.status ??
      itemAny['exame']?.statusExame ??
      itemAny['vacina']?.status ??
      itemAny['vacina']?.statusVacina ??
      '';

    return String(statusAlternativo).trim().toUpperCase();
  }

  private contarInternacoesAtivas(internacoes: InternacaoResponseDTO[]): number {
    const statusAtivos: StatusInternacao[] = [
      'PRE_INTERNACAO',
      'ADMITIDO',
      'EM_OBSERVACAO',
      'EM_TRATAMENTO',
      'POS_CIRURGICO',
      'AGUARDANDO_ALTA',
    ];

    return internacoes.filter((internacao) => statusAtivos.includes(internacao.statusInternacao)).length;
  }

  private extrairVeterinariosDisponiveisHoje(
    escalasMes: Array<{
      dia: number;
      horaInicio: string;
      horaFim: string;
      veterinarioId: number;
    }>,
    diaAtual: number,
    mapaVeterinarios: Map<
      number | undefined,
      { nome?: string; especialidade?: string | String; status?: boolean }
    >,
  ): VeterinarioDisponivel[] {
    const disponibilidadePorVet = new Map<number, string[]>();

    escalasMes
      .filter((item) => item.dia === diaAtual)
      .forEach((item) => {
        const horarios = disponibilidadePorVet.get(item.veterinarioId) ?? [];
        horarios.push(`${item.horaInicio} - ${item.horaFim}`);
        disponibilidadePorVet.set(item.veterinarioId, horarios);
      });

    return [...disponibilidadePorVet.entries()]
      .map(([veterinarioId, horarios]) => {
        const vet = mapaVeterinarios.get(veterinarioId);
        return {
          id: veterinarioId,
          nome: vet?.nome ?? 'Veterinario',
          especialidade: String(vet?.especialidade ?? 'Clinica geral'),
          ativo: vet?.status ?? true,
          horarios: [...new Set(horarios)],
        };
      })
      .filter((item) => item.ativo)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }

  private formatarDataPtBr(data: Date): string {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
  }

  private obterTotalElementos<T>(page: { content?: T[]; totalElements?: number; page?: { totalElements?: number } }): number {
    return page.totalElements ?? page.page?.totalElements ?? page.content?.length ?? 0;
  }
}

type VeterinarioDisponivel = {
  id: number;
  nome: string;
  especialidade: string;
  ativo: boolean;
  horarios: string[];
};
