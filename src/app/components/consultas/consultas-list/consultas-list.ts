import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  STATUS_BADGE_CLASS,
  STATUS_FONT_CLASS,
  STATUS_ICON_CLASS,
  StatusAgendamento,
  StatusAgendamentoLabels,
} from '../../models/consulta-model';
import { TipoAgendamento, TipoAgendamentoFrase, TipoAgendamentoLabels, AgendamentosAgrupados } from '../../models/agendamentos-model';
import { ConsultasFormAgendamentosModel } from '../../models/consultas-form-agendametos-model';
import { AgendamentosService } from '@features/agendamentos';

@Component({
  selector: 'app-consultas-list',
  templateUrl: './consultas-list.html',
  styleUrls: ['./consultas-list.scss'],
})
export class ConsultasList implements OnInit, OnChanges {
  @Input() diaSelected: string = ''; // recebido do pai

  agendamentoList: ConsultasFormAgendamentosModel[] = [];
  agendamentosFiltrados: ConsultasFormAgendamentosModel[] = [];
  agendamentosAgrupados: AgendamentosAgrupados = {
    consultas: [],
    cirurgias: [],
    exames: [],
    vacinas: [],
    totalConsultas: 0,
    totalCirurgias: 0,
    totalExames: 0,
    totalVacinas: 0,
    total: 0,
  };

  iconesStatus = STATUS_ICON_CLASS;
  fonteColorStatus = STATUS_FONT_CLASS;
  labelStatus = StatusAgendamentoLabels;
  badgeStatus = STATUS_BADGE_CLASS;
  agendamentoFrase = TipoAgendamentoFrase;
  tipoAgendamentoLabels = TipoAgendamentoLabels;
  TipoAgendamento = TipoAgendamento;

  constructor(
    private agendamentoService: AgendamentosService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Subscrever aos dados agrupados (quando backend suportar)
    this.agendamentoService.agendamentosAgrupados$.subscribe((agrupados) => {
      this.agendamentosAgrupados = agrupados;
      this.cdr.detectChanges();
    });

    // Manter a subscrição ao observable flat para compatibilidade
    this.agendamentoService.agendamentos$.subscribe((lista) => {
      this.agendamentoList = lista;
      this.filtrarAgendamentos();
    });

    this.listarAgendamentos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['diaSelected']) {
      this.listarAgendamentos();
      this.cdr.detectChanges();
    }
  }

  listarAgendamentos() {
    // Usar buscarPorCampo (formato Page) - backend ainda não retorna formato agrupado
    this.agendamentoService
      .buscarPorCampo({
        campo: 'dia',
        valor: this.diaSelected,
        page: 0,
        size: 100,
        sort: [
          { field: 'dia', direction: 'asc' },
          { field: 'horario', direction: 'asc' },
        ],
      })
      .subscribe({
        next: (data) => {
          // Normalizar status se estiver vindo em campos aninhados
          const conteudoNormalizado = (data.content ?? []).map(item => {
            if (!item.status) {
              let statusEncontrado: string | undefined;

              // Tentar encontrar status em qualquer campo aninhado por tipo
              if ((item as any).consulta?.statusConsulta) {
                statusEncontrado = (item as any).consulta.statusConsulta;
              } else if ((item as any).consulta?.status) {
                statusEncontrado = (item as any).consulta.status;
              } else if ((item as any).cirurgia?.statusCirurgia) {
                statusEncontrado = (item as any).cirurgia.statusCirurgia;
              } else if ((item as any).cirurgia?.status) {
                statusEncontrado = (item as any).cirurgia.status;
              } else if ((item as any).exame?.statusExame) {
                statusEncontrado = (item as any).exame.statusExame;
              } else if ((item as any).exame?.status) {
                statusEncontrado = (item as any).exame.status;
              } else if ((item as any).vacina?.statusVacina) {
                statusEncontrado = (item as any).vacina.statusVacina;
              } else if ((item as any).vacina?.status) {
                statusEncontrado = (item as any).vacina.status;
              }

              if (statusEncontrado) {
                return { ...item, status: statusEncontrado };
              }
            }
            return item;
          });

          // Agrupar manualmente os dados recebidos
          const consultas = conteudoNormalizado.filter(a => a.tipoAgendamento === 'CONSULTA') ?? [];
          const cirurgias = conteudoNormalizado.filter(a => a.tipoAgendamento === 'CIRURGIA') ?? [];
          const exames = conteudoNormalizado.filter(a => a.tipoAgendamento === 'EXAME') ?? [];
          const vacinas = conteudoNormalizado.filter(a => a.tipoAgendamento === 'VACINA') ?? [];

          this.agendamentosAgrupados = {
            consultas,
            cirurgias,
            exames,
            vacinas,
            totalConsultas: consultas.length,
            totalCirurgias: cirurgias.length,
            totalExames: exames.length,
            totalVacinas: vacinas.length,
            total: data.content?.length ?? 0,
          };

          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Erro ao listar agendamentos:', error);
        },
      });
  }

  private filtrarAgendamentos(): void {
    if (this.diaSelected) {
      this.agendamentosFiltrados = this.agendamentoList.filter((a) => a.dia === this.diaSelected);
    } else {
      this.agendamentosFiltrados = this.agendamentoList;
    }
  }

  getTipoAgendamentoFrase(tipo: string | undefined): string {
    if (!tipo || typeof tipo !== 'string') {
      return 'Agendamento para';
    }
    return this.agendamentoFrase[tipo as keyof typeof TipoAgendamentoFrase] ?? 'Agendamento para';
  }

  getStatusLabel(status: string | null | undefined): string {
    const statusNormalizado = status ?? StatusAgendamento.AGENDADO;

    if (statusNormalizado in this.labelStatus) {
      return this.labelStatus[statusNormalizado as StatusAgendamento];
    }

    return this.labelStatus[StatusAgendamento.AGENDADO];
  }

  getStatusIcon(status: string | null | undefined): string {
    const statusNormalizado = status ?? StatusAgendamento.AGENDADO;

    if (statusNormalizado in this.iconesStatus) {
      return this.iconesStatus[statusNormalizado as StatusAgendamento];
    }

    return this.iconesStatus[StatusAgendamento.AGENDADO];
  }

  getStatusFontColor(status: string | null | undefined): string {
    const statusNormalizado = status ?? StatusAgendamento.AGENDADO;

    if (statusNormalizado in this.fonteColorStatus) {
      return this.fonteColorStatus[statusNormalizado as StatusAgendamento];
    }

    return this.fonteColorStatus[StatusAgendamento.AGENDADO];
  }
}
