import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VacinaForm } from './vacina-form/vacina-form';
import { ConsultasFormAgendamentosModel } from '../../models/consultas-form-agendametos-model';
import { AgendamentosService } from '@features/agendamentos';
import { TipoAgendamento } from '../../models/agendamentos-model';
import { STATUS_BADGE_CLASS, StatusAgendamento } from '../../models/consulta-model';
import { AlertService } from '@shared/services';
import { ConsultasFormAgendamentos } from '../../consultas/consultas-form-agendamentos/consultas-form-agendamentos';

@Component({
  selector: 'app-vacinas',
  standalone: true,
  imports: [FormsModule, CommonModule, ConsultasFormAgendamentos, VacinaForm],
  templateUrl: './vacinas.html',
  styleUrl: './vacinas.scss',
})
export class Vacinas implements OnInit {
  @Input() selectedAgendamento?: ConsultasFormAgendamentosModel;
  @Input() abrirFormularioDireto = false;
  isAgedamento: boolean = false;
  isAtendimento = false;
  selectedAgendamentoDto?: ConsultasFormAgendamentosModel;
  tipoAgendamento = TipoAgendamento.VACINA;
  agendamentosFiltrados: ConsultasFormAgendamentosModel[] = [];
  diaSelected: string = new Date().toLocaleDateString('pt-BR');
  badgeStatus = STATUS_BADGE_CLASS;

  constructor(
    private agendamentoService: AgendamentosService,
    private cdr: ChangeDetectorRef,
    private alertService: AlertService,
  ) {}

  ngOnInit(): void {
    if (this.selectedAgendamento || this.abrirFormularioDireto) {
      this.selectedAgendamentoDto = this.selectedAgendamento;
      this.isAgedamento = true;
    } else {
      this.listarAgendamentos();
    }
  }

  listarAgendamentos() {
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
          console.log('Vacinas.listarAgendamentos - Dados brutos:', data.content);

          // Normalizar status se estiver vindo em campos aninhados
          const conteudoNormalizado = (data.content ?? []).map((item, idx) => {
            console.log(`[${idx}] ID: ${item.id}, tipoAgendamento: "${item.tipoAgendamento}", status: "${item.status}"`);
            console.log(`    Vacina completa:`, (item as any).vacina);

            if (!item.status) {
              let statusEncontrado: string | undefined;

              if ((item as any).vacina?.statusVacina) {
                statusEncontrado = (item as any).vacina.statusVacina;
                console.log(`  ✨ Status encontrado em vacina.statusVacina: "${statusEncontrado}"`);
              } else if ((item as any).vacina?.status) {
                statusEncontrado = (item as any).vacina.status;
                console.log(`  ✨ Status encontrado em vacina.status: "${statusEncontrado}"`);
              }

              if (statusEncontrado) {
                return { ...item, status: statusEncontrado };
              }
            }
            return item;
          });

          console.log('Vacinas.listarAgendamentos - Normalizado:', conteudoNormalizado.map(v => ({ id: v.id, status: v.status })));

          // Filtrar apenas vacinas
          this.agendamentosFiltrados = conteudoNormalizado.filter(
            a => a.tipoAgendamento === TipoAgendamento.VACINA
          );
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao carregar os agendamentos', err),
      });
  }

  onClickEmitter() {
    this.isAgedamento = true;
    this.isAtendimento = false;
    this.selectedAgendamentoDto = undefined;
  }

  onCancelar(): void {
    this.isAgedamento = false;
    this.isAtendimento = false;
    this.selectedAgendamentoDto = undefined;
    this.listarAgendamentos();
  }

  iniciarVacina(item: ConsultasFormAgendamentosModel): void {
    const atualizado = {
      ...item,
      status: StatusAgendamento.INICIADO,
      statusVacina: StatusAgendamento.INICIADO,
      vacina: {
        ...(item as any).vacina,
        status: StatusAgendamento.INICIADO,
        statusVacina: StatusAgendamento.INICIADO,
      },
    } as ConsultasFormAgendamentosModel;

    // Abre o atendimento imediatamente para evitar necessidade de duplo clique.
    this.selectedAgendamentoDto = atualizado;
    this.isAgedamento = true;
    this.isAtendimento = true;
    this.cdr.detectChanges();

    this.agendamentoService.atualizarAgendamento(atualizado).subscribe({
      next: () => {},
      error: () => {
        this.alertService.error('Erro ao iniciar vacina');
        this.onCancelar();
      },
    });
  }

  onAtendimentoConcluido(item: ConsultasFormAgendamentosModel): void {
    this.agendamentoService.atualizarAgendamento(item).subscribe({
      next: () => {
        this.alertService.success('Vacina finalizada com sucesso!');
        this.onCancelar();
      },
      error: () => this.alertService.error('Erro ao finalizar vacina'),
    });
  }

  editarAgendamento(item: ConsultasFormAgendamentosModel) {
    this.selectedAgendamentoDto = item;
    this.isAgedamento = true;
    this.isAtendimento = false;
  }

  getStatusClass(status: string | null | undefined): string {
    const statusNormalizado = status ?? StatusAgendamento.AGENDADO;
    if (statusNormalizado in this.badgeStatus) {
      return this.badgeStatus[statusNormalizado as StatusAgendamento];
    }
    return this.badgeStatus[StatusAgendamento.AGENDADO];
  }
}
