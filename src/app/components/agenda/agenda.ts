import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  SimpleChanges,
  computed,
  effect,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConsultasFormAgendamentos } from '../consultas/consultas-form-agendamentos/consultas-form-agendamentos';
import { STATUS_BADGE_CLASS, StatusAgendamento } from '../models/consulta-model';
import { ConsultasFormAgendamentosModel } from '../models/consultas-form-agendametos-model';
import { TipoAgendamento, AgendamentosAgrupados } from '../models/agendamentos-model';
import { AgendamentosService } from '../services/agendamentos-service';
import { AlertService } from '../services/alert-service';
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
  selectedAgendamentoDto?: ConsultasFormAgendamentosModel;
  diaSelected = signal<Date>(new Date());
  refreshCards = false;
  diaFormatado = computed(() => this.diaSelected().toLocaleDateString('pt-BR'));

  agendamentosList = signal<ConsultasFormAgendamentosModel[]>([]);

  // Agendamentos agrupados por tipo
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
  TipoAgendamento = TipoAgendamento;

  constructor(
    private cdr: ChangeDetectorRef,
    private service: AgendamentosService,
    private router: Router,
    private swa: AlertService,
  ) {
    effect(() => {
      const data = this.diaSelected();
      setTimeout(() => {
        this.listarAgendamentos();
      }, 50);
    });
  }

  ngOnInit(): void {
    this.listarAgendamentos();
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
    this.service
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
          this.agendamentosList.set([...conteudo]);

          // Agrupar agendamentos por tipo
          const consultas = conteudo.filter(a => a.tipoAgendamento === TipoAgendamento.CONSULTA);
          const cirurgias = conteudo.filter(a => a.tipoAgendamento === TipoAgendamento.CIRURGIA);
          const exames = conteudo.filter(a => a.tipoAgendamento === TipoAgendamento.EXAME);
          const vacinas = conteudo.filter(a => a.tipoAgendamento === TipoAgendamento.VACINA);

          this.agendamentosAgrupados = {
            consultas,
            cirurgias,
            exames,
            vacinas,
            totalConsultas: consultas.length,
            totalCirurgias: cirurgias.length,
            totalExames: exames.length,
            totalVacinas: vacinas.length,
            total: conteudo.length,
          };

          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao carregar os agendamentos', err),
      });
  }

  iniciarConsulta(item: ConsultasFormAgendamentosModel) {
    this.atualizarConsultaStatus(item, 'INICIADO' as any);
  }

  finalizarConsulta(item: ConsultasFormAgendamentosModel) {
    if (item.status) {
      this.atualizarConsultaStatus(item, item.status);
    }
    this.isFormVisible = false;
    this.selectedAgendamentoDto = undefined;
  }

  consultarPet(id: number): void {
    this.service.buscarPorId(id).subscribe({
      next: (item: ConsultasFormAgendamentosModel) => {
        this.selectedAgendamentoDto = item;
        this.router.navigate(['/consultas'], {
          state: { agendamentoConsulta: item },
        });
      },
      error: () => this.swa.error('Erro ao buscar dados.'),
    });
  }

  confirmarConsulta(dto: ConsultasFormAgendamentosModel, confirmar: boolean) {
    const novoStatus = confirmar ? StatusAgendamento.CONFIRMADO : StatusAgendamento.CANCELADO;
    const msg = confirmar ? 'Consulta confirmada!' : 'Consulta cancelada!';
    this.atualizarConsultaStatus(dto, novoStatus as any, msg, confirmar);
  }

  private atualizarConsultaStatus(
    item: ConsultasFormAgendamentosModel,
    status: any,
    mensagem?: string,
    sucesso?: boolean,
  ) {
    const dtoBase: ConsultasFormAgendamentosModel = {
      ...item,
      status: status,
    };

    const dto = this.limparCampos(dtoBase);

    this.service.atualizarConsulta(dto).subscribe({
      next: () => {
        if (mensagem) {
          sucesso ? this.swa.success(mensagem) : this.swa.warning(mensagem);
        }
        this.listarAgendamentos();
      },
      error: () => this.swa.error(`Erro ao atualizar consulta: ${mensagem || 'operação'}`),
    });
  }

  private limparCampos(dto: ConsultasFormAgendamentosModel): ConsultasFormAgendamentosModel {
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

  reagendarConsulta(item: ConsultasFormAgendamentosModel) {
    this.selectedTipoAgendamento = TipoAgendamento.CONSULTA;
    this.selectedAgendamento = this.getTipoAgendamentoLabel(this.selectedTipoAgendamento);
    this.isvisible = !!this.selectedAgendamento;
    this.selectedAgendamentoDto = item;
  }

  editarAgendamento(item: ConsultasFormAgendamentosModel) {
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
