import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConsultasFormAgendamentos } from '../consultas/consultas-form-agendamentos/consultas-form-agendamentos';
import { STATUS_BADGE_CLASS } from '../models/consulta-model';
import { ConsultasFormAgendamentosModel } from '../models/consultas-form-agendametos-model';
import { AgendamentosService } from '../services/agendamentos-service';
import { Cirurgias } from './cirurgias/cirurgias';
import { Exames } from './exames/exames';

@Component({
  selector: 'app-agenda',
  imports: [FormsModule, CommonModule, ConsultasFormAgendamentos, Exames, Cirurgias],
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
  diaSelected: string = new Date().toLocaleDateString('pt-BR');

  agendamentosList: ConsultasFormAgendamentosModel[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: AgendamentosService,
    private router: Router,
  ) {}
  ngOnInit(): void {
    this.listarAgendamentos();
  }

  get _agendamentosList(): ConsultasFormAgendamentosModel[] {
    return this.agendamentosList;
  }

  set _agendamentosList(value: ConsultasFormAgendamentosModel[]) {
    this.agendamentosList = value;
    this.cdr.detectChanges();
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

  listarAgendamentos() {
    this.service
      .buscarPorCampo({ campo: 'dia', valor: this.diaSelected, page: 0, size: 20 })
      .subscribe({
        next: (data) => {
          this.agendamentosList = data.content ?? [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao carregar os agendamentos', err),
      });
  }

  editar(id: number) {
    this.service.buscarPorId(id).subscribe({
      next: (item: ConsultasFormAgendamentosModel) => {
        this.consultarPet(item.id);
      },
      error: () => alert('Erro ao buscar dados.'),
    });
  }

  iniciarConsulta(item: ConsultasFormAgendamentosModel) {
    const agendaDto: ConsultasFormAgendamentosModel = {
      ...(item ?? {}),
      consulta: {
        ...item.consulta,
        status: 'INICIADO' as any,
      },
    };

    delete (agendaDto as any).veterinarioNome;
    delete (agendaDto as any).petNome;
    this.service.atualizar(agendaDto).subscribe({
      next: () => {
        this.service.buscarPorId(item.id).subscribe({
          next: (agendamento: ConsultasFormAgendamentosModel) => {
            this.consultarPet(agendamento.id);
          },
          error: () => alert('Erro ao buscar dados.'),
        });
      },
      error: (err) => {
        console.error('Erro ao iniciar consulta', err);
        alert('Erro ao iniciar consulta');
      },
    });
  }

  finalizarConsulta($event: ConsultasFormAgendamentosModel) {
    this.service.atualizar($event).subscribe({
      next: () => {
        console.log('Consulta finalizada com sucesso!');
        this.listarAgendamentos();
        this.isFormVisible = false;
        this.selectedAgendamentoDto = undefined;
      },
      error: (err) => {
        console.error('Erro ao finalizar consulta', err);
        alert('Erro ao finalizar consulta');
      },
    });
  }

  consultarPet(id: number): void {
    this.service.buscarPorId(id).subscribe({
      next: (item: ConsultasFormAgendamentosModel) => {
        this.selectedAgendamentoDto = item;
        this.router.navigate(['/consultas'], {
          state: { agendamentoConsulta: item },
        });
      },
      error: () => alert('Erro ao buscar dados.'),
    });
  }

  confirmarConsulta(dto: ConsultasFormAgendamentosModel) {
    const agendaDto: ConsultasFormAgendamentosModel = {
      ...(dto ?? {}),
      consulta: {
        ...dto.consulta,
        status: 'CONFIRMADO' as any,
      },
    };
    delete (agendaDto as any).veterinarioNome;
    delete (agendaDto as any).petNome;
    this.service.atualizar(agendaDto).subscribe({
      next: () => {
        alert('Consulta confirmada com sucesso!');
        this.listarAgendamentos();
      },
      error: (err) => {
        console.error('Erro ao confirmar consulta', err);
        alert('Erro ao confirmar consulta');
      },
    });
  }

  onCancelar() {
    this.isvisible = false;
    this.selectedAgendamento = '';
  }

}
