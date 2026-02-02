import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { STATUS_BADGE_CLASS } from '../models/consulta-model';
import { ConsultasFormAgendamentosModel } from '../models/consultas-form-agendametos-model';
import { AgendamentosService } from '../services/agendamentos-service';
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

  constructor(
    private cdr: ChangeDetectorRef,
    private agendamentoService: AgendamentosService,
  ) {}

  ngOnInit(): void {
    this.listarAgendamentos();
  }

  listarAgendamentos() {
    this.agendamentoService
      .buscarPorCampo({ campo: 'dia', valor: this.diaSelected, page: 0, size: 20 })
      .subscribe({
        next: (data) => {
          this.agendamentosFiltrados = data.content ?? [];
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Erro ao carregar os agendamentos', err),
      });
  }

  onCancelar() {
    this.isAgedamento = false;
    this.nome = '';
  }

  onClickEmitter() {
    this.isAgedamento = true;
    this.nome = 'Agendar';
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
    this.agendamentoService.atualizar(agendaDto).subscribe({
      next: () => {
        this.agendamentoService.buscarPorId(item.id).subscribe({
          next: (agendamento: ConsultasFormAgendamentosModel) => {
            this.listarAgendamentos();
            this.isAgedamento = false;
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
    this.cdr.detectChanges();
  }

  consultarPet(id: number): void {
    this.agendamentoConsulta = this.agendamentosFiltrados.find((agendamento) => agendamento.id === id);
    console.log('Agendamento para consulta:', this.agendamentoConsulta);
    this.cdr.detectChanges();
  }

  // 🔑 quando uma consulta é concluída, atualiza o BehaviorSubject
  onConsultaConcluida(event: ConsultasFormAgendamentosModel) {
    console.log('Consulta concluída:', event);

    // salva no backend e atualiza automaticamente o BehaviorSubject
    this.agendamentoService.salvar(event).subscribe({
      next: () => {
        Swal.fire('Consulta salva com sucesso!', '', 'success');
      },
      error: (err) => {
        console.error('Erro ao salvar consulta:', err);
        Swal.fire('Erro ao salvar consulta', '', 'error');
      },
    });

    this.cdr.detectChanges(); // força atualização visual imediata
  }
}
