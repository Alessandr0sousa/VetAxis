import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, SimpleChanges, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConsultasFormAgendamentos } from '../consultas/consultas-form-agendamentos/consultas-form-agendamentos';
import { STATUS_BADGE_CLASS, StatusAgendamento } from '../models/consulta-model';
import { ConsultasFormAgendamentosModel } from '../models/consultas-form-agendametos-model';
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
  isvisible: boolean = false;
  STATUS_BADGE_CLASS = STATUS_BADGE_CLASS;
  isFormVisible: boolean = false;
  selectedAgendamentoDto?: ConsultasFormAgendamentosModel;
  diaSelected = signal<Date>(new Date());
  refreshCards = false;
  diaFormatado = computed(() =>
    this.diaSelected().toLocaleDateString('pt-BR')
  );

  agendamentosList = signal<ConsultasFormAgendamentosModel[]>([]);

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
    this.selectedAgendamento = input.value;
    this.isvisible = !!this.selectedAgendamento;
  }

  private formatDataISO(data: Date): string {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${dia}/${mes}/${ano}`;
  }

  listarAgendamentos() {
    const dataEnviada = this.formatDataISO(this.diaSelected());
    this.service
      .buscarPorCampo({
        campo: 'dia',
        valor: dataEnviada,
        page: 0,
        size: 20,
        sort: [
          { field: 'dia', direction: 'asc' },
          { field: 'horario', direction: 'asc' },
        ],
      })
      .subscribe({
        next: (data) => {
          this.agendamentosList.set([...(data.content ?? [])]);
        },
        error: (err) => console.error('Erro ao carregar os agendamentos', err),
      });
  }

  iniciarConsulta(item: ConsultasFormAgendamentosModel) {
    this.atualizarConsultaStatus(item, 'INICIADO' as any);
  }

  finalizarConsulta(item: ConsultasFormAgendamentosModel) {
    if (item.consulta) {
      this.atualizarConsultaStatus(item, item.consulta.status);
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
    sucesso?: boolean
  ) {
    // Se não houver consulta, criar estrutura padrão
    const consultaBase = item.consulta || {
      anamnese: '',
      exameFisico: '',
      tratamento: '',
      prescricao: '',
      diagnostico: '',
      internamento: false,
      status: status
    };

    const dto: ConsultasFormAgendamentosModel = {
      ...item,
      consulta: { ...consultaBase, status },
    };

    this.limparCampos(dto);

    this.service.atualizar(dto).subscribe({
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
    this.selectedAgendamentoDto = undefined; // limpa dto
    this.listarAgendamentos();
  }

  reagendarConsulta(item: ConsultasFormAgendamentosModel) {
    this.selectedAgendamento = 'Consultas';
    this.isvisible = !!this.selectedAgendamento;
    this.selectedAgendamentoDto = item;
  }

  editarAgendamento(item: ConsultasFormAgendamentosModel) {
    this.selectedAgendamento = 'Consultas';
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
}
