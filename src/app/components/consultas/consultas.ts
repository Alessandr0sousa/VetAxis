import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { STATUS_BADGE_CLASS } from '../models/consulta-model';
import { ConsultasFormAgendamentosModel } from '../models/consultas-form-agendametos-model';
import { AgendamentosService } from '../services/agendamentos-service';
import { AlertService } from '../services/alert-service';
import { ConsultaForm } from './consulta-form/consulta-form';
import { ConsultasFormAgendamentos } from './consultas-form-agendamentos/consultas-form-agendamentos';

@Component({
  selector: 'app-consultas',
  standalone: true,
  imports: [ConsultaForm, ConsultasFormAgendamentos],
  templateUrl: './consultas.html',
  styleUrls: ['./consultas.scss'],
})
export class Consultas implements OnInit {
  nome: string = '';
  isAgedamento: boolean = false;
  agendamentoConsulta?: ConsultasFormAgendamentosModel;
  badgeStatus = STATUS_BADGE_CLASS;
  agendamentosFiltrados: ConsultasFormAgendamentosModel[] = [];
  diaSelected: string = new Date().toLocaleDateString('pt-BR');
  retorno?: ConsultasFormAgendamentosModel;

  constructor(
    private cdr: ChangeDetectorRef,
    private agendamentoService: AgendamentosService,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    this.listarAgendamentos();
  }

  get _isAgendamento(): boolean {
    return this.isAgedamento;
  }

  set _isAgendamento(value: boolean) {
    this.isAgedamento = value;
  }

  listarAgendamentos() {
    this.agendamentoService
      .buscarPorCampo({
        campo: 'dia',
        valor: this.diaSelected,
        page: 0,
        size: 20,
        sort: [
          { field: 'dia', direction: 'asc' },
          { field: 'horario', direction: 'asc' },
        ],
      })
      .subscribe({
        next: (data) => {
          this.agendamentosFiltrados = data.content ?? [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao carregar os agendamentos', err),
      });
  }

  onCancelar() {
    this.agendamentoConsulta = undefined;
    this.isAgedamento = false;
    this.nome = '';
    this.listarAgendamentos();
  }

  onClickEmitter() {
    this.isAgedamento = true;
    this.nome = 'Agendar';
  }

  async iniciarConsulta(item: ConsultasFormAgendamentosModel) {
    try {
      const agendaDto: ConsultasFormAgendamentosModel = {
        ...(item ?? {}),
        consulta: {
          anamnese: item.consulta?.anamnese || '',
          exameFisico: item.consulta?.exameFisico || '',
          tratamento: item.consulta?.tratamento || '',
          prescricao: item.consulta?.prescricao || '',
          diagnostico: item.consulta?.diagnostico || '',
          internamento: item.consulta?.internamento || false,
          status: 'INICIADO' as any,
        },
      };

      delete (agendaDto as any).veterinarioNome;
      delete (agendaDto as any).petNome;

      await firstValueFrom(this.agendamentoService.atualizar(agendaDto));

      const agendamento = await firstValueFrom(this.agendamentoService.buscarPorId(item.id));
      this.listarAgendamentos();
      this.isAgedamento = false;
      this.consultarPet(agendamento.id);
      this.cdr.markForCheck();
    } catch (err) {
      this.alertService.error('Erro ao buscar dados');
    }
  }

  consultarPet(id: number): void {
    this.agendamentoConsulta = this.agendamentosFiltrados.find(
      (agendamento) => agendamento.id === id,
    );
    this.cdr.detectChanges();
  }

  onConsultaConcluida(event: ConsultasFormAgendamentosModel) {
    this.agendamentoService.atualizar(event).subscribe({
      next: () => {
        this.listarAgendamentos();
        this.marcarRetorno(event);
      },
      error: (err) => {
        this.alertService.error('Erro ao salvar consulta');
      },
    });

    this.cdr.detectChanges();
  }

  marcarRetorno(item: ConsultasFormAgendamentosModel) {
    this.alertService.confirm('Deseja agendar retorno dessa consulta?').then((resposta) => {
      if (resposta) {
        item.isRetorno = true;
        this.retorno = item;
        this.onCancelar();
        this.onClickEmitter();
      } else {
        this.alertService.success('Consulta conclída com sucesso!');
      }
    });
  }
}
