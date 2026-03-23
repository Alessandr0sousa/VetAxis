import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Injector,
  OnInit,
  SimpleChanges,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConsultasFormAgendamentos } from '../consultas/consultas-form-agendamentos/consultas-form-agendamentos';
import { STATUS_BADGE_CLASS, StatusAgendamento } from '../models/consulta-model';
import { TipoAgendamento, AgendamentosAgrupados, AgendamentoCompleto } from '@core/models';
import type { AgendamentosService } from '@features/agendamentos';
import { AlertService } from '@shared/services';
import { Cirurgias } from './cirurgias/cirurgias';
import { Exames } from './exames/exames';
import { Vacinas } from './vacinas/vacinas';

@Component({
  selector: 'app-agenda',
  imports: [FormsModule, CommonModule, ConsultasFormAgendamentos, Exames, Cirurgias, Vacinas],
  templateUrl: './agenda.html',
  styleUrls: ['./agenda.scss'],
})
export class Agenda implements OnInit {
  agendamentos: string[] = ['Cirurgias', 'Consultas', 'Exames', 'Vacinas'];
  selectedAgendamento: string = '';
  selectedTipoAgendamento?: TipoAgendamento;
  isvisible: boolean = false;
  STATUS_BADGE_CLASS = STATUS_BADGE_CLASS;
  isFormVisible: boolean = false;
  selectedAgendamentoDto?: AgendamentoCompleto;
  diaSelected = signal<Date>(new Date());
  refreshCards = false;
  diaFormatado = computed(() => this.diaSelected().toLocaleDateString('pt-BR'));

  agendamentosList = signal<AgendamentoCompleto[]>([]);

  // Agendamentos agrupados por tipo
  agendamentosAgrupados = signal<AgendamentosAgrupados>({
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
  TipoAgendamento = TipoAgendamento;

  private cdr = inject(ChangeDetectorRef);
  private injector = inject(Injector);
  private service: AgendamentosService | null = null;
  private router = inject(Router);
  private swa = inject(AlertService);

  constructor() {
    effect(() => {
      const data = this.diaSelected();
      if (!this.service) {
        return;
      }
      setTimeout(() => {
        this.listarAgendamentos();
      }, 50);
    });
  }

  async ngOnInit(): Promise<void> {
    await this.ensureService();
    this.listarAgendamentos();
  }

  private async ensureService(): Promise<void> {
    if (this.service) {
      return;
    }
    const module = await import('@features/agendamentos');
    this.service = this.injector.get(module.AgendamentosService);
  }

  private getService(): AgendamentosService {
    if (!this.service) {
      throw new Error('AgendamentosService ainda não inicializado');
    }
    return this.service;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedAgendamento']) {
      this.listarAgendamentos();
    }
  }

  changeComponentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const tipo = this.parseTipoAgendamento(input.value);
    this.selectedTipoAgendamento = tipo;
    this.selectedAgendamento = tipo ? this.getTipoAgendamentoLabel(tipo) : '';
    this.isvisible = !!tipo;
  }

  private formatDataISO(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${dia}/${mes}/${ano}`;
  }

  getStatusClass(status: string | null | undefined): string {
    const statusNormalizado = status ?? StatusAgendamento.AGENDADO;

    if (statusNormalizado in this.STATUS_BADGE_CLASS) {
      return this.STATUS_BADGE_CLASS[statusNormalizado as StatusAgendamento];
    }

    return this.STATUS_BADGE_CLASS[StatusAgendamento.AGENDADO];
  }

  listarAgendamentos() {
    const dataEnviada = this.formatDataISO(this.diaSelected());
    console.log('🔄 Agenda.listarAgendamentos - Buscando agendamentos para:', dataEnviada);

    this.getService()
      .buscarPorCampo({
        campo: 'dia',
        valor: dataEnviada,
        page: 0,
        size: 100,
        sort: [
          { field: 'dia', direction: 'asc' },
          { field: 'horario', direction: 'asc' },
        ],
      })
      .subscribe({
        next: (data) => {
          const conteudo = data.content ?? [];
          console.log('📊 Agenda.listarAgendamentos - Dados recebidos:', conteudo);

          // Log detalhado com estrutura completa
          conteudo.forEach((item, index) => {
            console.log(`[${index}] ID: ${item.id}, Status: "${item.status}", Tipo: ${item.tipoAgendamento}`);
            console.log(`    Campos de status alternativos:`, {
              statusConsulta: (item as any).statusConsulta,
              statusCirurgia: (item as any).statusCirurgia,
              statusExame: (item as any).statusExame,
              statusVacina: (item as any).statusVacina,
              'consulta?.status': (item as any).consulta?.status,
              'cirurgia?.status': (item as any).cirurgia?.status,
              'exame?.status': (item as any).exame?.status,
              'vacina?.status': (item as any).vacina?.status,
            });
          });

          this.agendamentosList.set([...conteudo]);

          // Normalizar status se estiver vindo em campos diferentes
          const conteudoNormalizado = conteudo.map(item => {
            if (!item.status) {
              // Procurar status nos objetos aninhados por tipo
              let statusEncontrado: string | undefined;

              // Tentar encontrar status em qualquer campo aninhado
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
                console.log(`  ✨ Normalizando ID ${item.id}: ${item.tipoAgendamento}.status = "${statusEncontrado}"`);
                return { ...item, status: statusEncontrado };
              }
            }
            return item;
          });

          this.agendamentosList.set([...conteudoNormalizado]);

          // Agrupar agendamentos por tipo
          const consultas = conteudoNormalizado.filter(a => a.tipoAgendamento === TipoAgendamento.CONSULTA);
          const cirurgias = conteudoNormalizado.filter(a => a.tipoAgendamento === TipoAgendamento.CIRURGIA);
          const exames = conteudoNormalizado.filter(a => a.tipoAgendamento === TipoAgendamento.EXAME);
          const vacinas = conteudoNormalizado.filter(a => a.tipoAgendamento === TipoAgendamento.VACINA);

          this.agendamentosAgrupados.set({
            consultas,
            cirurgias,
            exames,
            vacinas,
            totalConsultas: consultas.length,
            totalCirurgias: cirurgias.length,
            totalExames: exames.length,
            totalVacinas: vacinas.length,
            total: conteudo.length,
          });

          console.log('✅ Agenda.listarAgendamentos - Agrupados:', {
            consultas: consultas.map(c => ({ id: c.id, status: c.status })),
            cirurgias: cirurgias.map(c => ({ id: c.id, status: c.status })),
            exames: exames.map(e => ({ id: e.id, status: e.status })),
            vacinas: vacinas.map(v => ({ id: v.id, status: v.status })),
          });

          this.cdr.detectChanges();
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Erro ao listar agendamentos:', err),
      });
  }

  iniciarConsulta(item: AgendamentoCompleto) {
    this.atualizarConsultaStatus(item, 'INICIADO' as any);
  }

  finalizarConsulta(item: AgendamentoCompleto) {
    if (item.status) {
      this.atualizarConsultaStatus(item, item.status);
    }
    this.isFormVisible = false;
    this.selectedAgendamentoDto = undefined;
  }

  consultarPet(id: number): void {
    this.getService().buscarPorId(id).subscribe({
      next: (item: AgendamentoCompleto) => {
        this.selectedAgendamentoDto = item;
        this.router.navigate(['/consultas'], {
          state: { agendamentoConsulta: item },
        });
      },
      error: () => this.swa.error('Erro ao buscar dados.'),
    });
  }

  confirmarConsulta(dto: AgendamentoCompleto, confirmar: boolean) {
    const novoStatus = confirmar ? StatusAgendamento.CONFIRMADO : StatusAgendamento.CANCELADO;
    const msg = confirmar ? 'Consulta confirmada!' : 'Consulta cancelada!';
    this.atualizarConsultaStatus(dto, novoStatus as any, msg, confirmar);
  }

  private atualizarConsultaStatus(
    item: AgendamentoCompleto,
    status: any,
    mensagem?: string,
    sucesso?: boolean,
  ) {
    const dtoBase: AgendamentoCompleto = {
      ...item,
      status,
      ...( { statusAgendamento: status } as any ),
      ...(item.tipoAgendamento === TipoAgendamento.CONSULTA
        ? ({ statusConsulta: status, consulta: { ...(item as any).consulta, status } } as any)
        : {}),
      ...(item.tipoAgendamento === TipoAgendamento.CIRURGIA
        ? ({ statusCirurgia: status, cirurgia: { ...(item as any).cirurgia, status, statusCirurgia: status } } as any)
        : {}),
      ...(item.tipoAgendamento === TipoAgendamento.EXAME
        ? ({ statusExame: status, exame: { ...(item as any).exame, status, statusExame: status } } as any)
        : {}),
      ...(item.tipoAgendamento === TipoAgendamento.VACINA
        ? ({ statusVacina: status, vacina: { ...(item as any).vacina, status, statusVacina: status } } as any)
        : {}),
    };

    const dto = this.limparCampos(dtoBase);

    console.log('📤 Agenda.atualizarConsultaStatus - DTO construído:', {
      id: dto.id,
      tipoAgendamento: dto.tipoAgendamento,
      status: dto.status,
      statusAgendamento: (dto as any).statusAgendamento,
      statusConsulta: (dto as any).statusConsulta,
      statusCirurgia: (dto as any).statusCirurgia,
      statusExame: (dto as any).statusExame,
      statusVacina: (dto as any).statusVacina,
      dtoCompleto: dto,
    });

    this.getService().atualizarAgendamento(dto).subscribe({
      next: (resposta) => {
        console.log('✅ Agenda.atualizarConsultaStatus - Resposta do servidor:', resposta);

        if (mensagem) {
          sucesso ? this.swa.success(mensagem) : this.swa.warning(mensagem);
        }

        // Forçar recarregamento total da lista
        console.log('🔄 Agenda.atualizarConsultaStatus - Recarregando lista de agendamentos...');
        setTimeout(() => {
          this.listarAgendamentos();
          this.cdr.detectChanges();
          this.cdr.markForCheck();
          console.log('✅ Agenda.atualizarConsultaStatus - Lista recarregada e detecção de mudanças acionada');
        }, 100);
      },
      error: (err) => {
        console.error('❌ Agenda.atualizarConsultaStatus - Erro ao atualizar:', err);
        this.swa.error(`Erro ao atualizar consulta: ${mensagem || 'operação'}`);
      },
    });
  }

  private limparCampos(dto: AgendamentoCompleto): AgendamentoCompleto {
    const copia = { ...dto };
    delete (copia as any).veterinarioNome;
    delete (copia as any).petNome;
    return copia;
  }

  onCancelar() {
    this.isvisible = false;
    this.selectedAgendamento = '';
    this.selectedTipoAgendamento = undefined;
    this.selectedAgendamentoDto = undefined; // limpa dto
    this.listarAgendamentos();
  }

  reagendarConsulta(item: AgendamentoCompleto) {
    this.selectedTipoAgendamento = TipoAgendamento.CONSULTA;
    this.selectedAgendamento = this.getTipoAgendamentoLabel(this.selectedTipoAgendamento);
    this.isvisible = !!this.selectedAgendamento;
    this.selectedAgendamentoDto = item;
  }

  editarAgendamento(item: AgendamentoCompleto) {
    this.selectedTipoAgendamento = this.parseTipoAgendamento(item.tipoAgendamento);
    this.selectedAgendamento = this.selectedTipoAgendamento
      ? this.getTipoAgendamentoLabel(this.selectedTipoAgendamento)
      : 'Consultas';
    this.isvisible = !!this.selectedAgendamento;
    this.selectedAgendamentoDto = item;
  }

  private alterarDia(dias: number) {
    const data = new Date(this.diaSelected());
    data.setDate(data.getDate() + dias);
    this.diaSelected.set(data);
  }

  incrementarDia() {
    this.alterarDia(1);
  }

  decrementarDia() {
    this.alterarDia(-1);
  }

  private getTipoAgendamentoLabel(tipo: TipoAgendamento): string {
    const mapa: { [key in TipoAgendamento]: string } = {
      [TipoAgendamento.CONSULTA]: 'Consultas',
      [TipoAgendamento.CIRURGIA]: 'Cirurgias',
      [TipoAgendamento.EXAME]: 'Exames',
      [TipoAgendamento.VACINA]: 'Vacinas',
    };
    return mapa[tipo] || 'Consultas';
  }

  getTipoAgendamentoEnum(label: string): TipoAgendamento {
    return this.parseTipoAgendamento(label) ?? TipoAgendamento.CONSULTA;
  }

  private normalizarTipoAgendamentoLabel(valor: string): string {
    const normalizado = (valor || '')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    if (normalizado === 'consulta' || normalizado === 'consultas') {
      return 'Consultas';
    }
    if (normalizado === 'cirurgia' || normalizado === 'cirurgias') {
      return 'Cirurgias';
    }
    if (normalizado === 'exame' || normalizado === 'exames') {
      return 'Exames';
    }
    if (normalizado === 'vacina' || normalizado === 'vacinas') {
      return 'Vacinas';
    }

    return '';
  }

  private parseTipoAgendamento(valor?: string): TipoAgendamento | undefined {
    const texto = (valor ?? '').trim();
    if (!texto) {
      return undefined;
    }

    if (texto === TipoAgendamento.CONSULTA) return TipoAgendamento.CONSULTA;
    if (texto === TipoAgendamento.CIRURGIA) return TipoAgendamento.CIRURGIA;
    if (texto === TipoAgendamento.EXAME) return TipoAgendamento.EXAME;
    if (texto === TipoAgendamento.VACINA) return TipoAgendamento.VACINA;

    const label = this.normalizarTipoAgendamentoLabel(texto);
    if (label === 'Consultas') return TipoAgendamento.CONSULTA;
    if (label === 'Cirurgias') return TipoAgendamento.CIRURGIA;
    if (label === 'Exames') return TipoAgendamento.EXAME;
    if (label === 'Vacinas') return TipoAgendamento.VACINA;

    return undefined;
  }
}
