import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultasFormAgendamentos } from '../../consultas/consultas-form-agendamentos/consultas-form-agendamentos';
import { ConsultasFormAgendamentosModel } from '../../models/consultas-form-agendametos-model';
import { AgendamentosService } from '@features/agendamentos';
import { TipoAgendamento } from '../../models/agendamentos-model';
import { STATUS_BADGE_CLASS, StatusAgendamento } from '../../models/consulta-model';
import { AlertService } from '@shared/services';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cirurgias',
  standalone: true,
  imports: [FormsModule, CommonModule, ConsultasFormAgendamentos],
  templateUrl: './cirurgias.html',
  styleUrl: './cirurgias.scss',
})
export class Cirurgias implements OnInit {
  @Input() selectedAgendamento?: ConsultasFormAgendamentosModel;
  @Input() abrirFormularioDireto = false;
  isAgedamento: boolean = false;
  selectedAgendamentoDto?: ConsultasFormAgendamentosModel;
  tipoAgendamento = TipoAgendamento.CIRURGIA;
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
          console.log('Cirurgias.listarAgendamentos - Dados brutos:', data.content);

          // Normalizar status se estiver vindo em campos aninhados
          const conteudoNormalizado = (data.content ?? []).map((item, idx) => {
            console.log(`[${idx}] ID: ${item.id}, tipoAgendamento: "${item.tipoAgendamento}", status: "${item.status}"`);
            console.log(`    Cirurgia completa:`, (item as any).cirurgia);

            if (!item.status) {
              let statusEncontrado: string | undefined;

              if ((item as any).cirurgia?.statusCirurgia) {
                statusEncontrado = (item as any).cirurgia.statusCirurgia;
                console.log(`  ✨ Status encontrado em cirurgia.statusCirurgia: "${statusEncontrado}"`);
              } else if ((item as any).cirurgia?.status) {
                statusEncontrado = (item as any).cirurgia.status;
                console.log(`  ✨ Status encontrado em cirurgia.status: "${statusEncontrado}"`);
              }

              if (statusEncontrado) {
                return { ...item, status: statusEncontrado };
              }
            }
            return item;
          });

          console.log('Cirurgias.listarAgendamentos - Normalizado:', conteudoNormalizado.map(c => ({ id: c.id, status: c.status })));

          // Filtrar apenas cirurgias
          this.agendamentosFiltrados = conteudoNormalizado.filter(
            a => a.tipoAgendamento === TipoAgendamento.CIRURGIA
          );
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao carregar os agendamentos', err),
      });
  }

  onClickEmitter() {
    this.isAgedamento = true;
    this.selectedAgendamentoDto = undefined;
  }

  onCancelar(): void {
    this.isAgedamento = false;
    this.selectedAgendamentoDto = undefined;
    this.listarAgendamentos();
  }

  editarAgendamento(item: ConsultasFormAgendamentosModel) {
    this.selectedAgendamentoDto = item;
    this.isAgedamento = true;
  }

  getStatusClass(status: string | null | undefined): string {
    const statusNormalizado = status ?? StatusAgendamento.AGENDADO;
    if (statusNormalizado in this.badgeStatus) {
      return this.badgeStatus[statusNormalizado as StatusAgendamento];
    }
    return this.badgeStatus[StatusAgendamento.AGENDADO];
  }
}
