import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { STATUS_BADGE_CLASS, StatusAgendamento } from '../models/consulta-model';
import { ConsultasFormAgendamentosModel } from '../models/consultas-form-agendametos-model';
import { AgendamentosService } from '@features/agendamentos';
import { AlertService } from '@shared/services';
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

          // Filtrar apenas agendamentos do tipo CONSULTA
          this.agendamentosFiltrados = conteudoNormalizado.filter(
            (item) => item.tipoAgendamento === 'CONSULTA',
          );
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
        anamnese: item.anamnese || '',
        exameFisico: item.exameFisico || '',
        tratamento: item.tratamento || '',
        prescricao: item.prescricao || '',
        diagnostico: item.diagnostico || '',
        internamento: item.internamento || false,
        status: 'INICIADO',
      };

      delete (agendaDto as any).veterinarioNome;
      delete (agendaDto as any).petNome;

      await firstValueFrom(this.agendamentoService.atualizarConsulta(agendaDto));

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
    this.agendamentoService.atualizarConsulta(event).subscribe({
      next: () => {
        this.listarAgendamentos();
        this.marcarRetorno(event);
      },
      error: (err: any) => {
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

  getStatusClass(status: string | null | undefined): string {
    const statusNormalizado = status ?? StatusAgendamento.AGENDADO;

    if (statusNormalizado in this.badgeStatus) {
      return this.badgeStatus[statusNormalizado as StatusAgendamento];
    }

    return this.badgeStatus[StatusAgendamento.AGENDADO];
  }
}
