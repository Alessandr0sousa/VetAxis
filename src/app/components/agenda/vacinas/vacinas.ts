import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultasFormAgendamentos } from '../../consultas/consultas-form-agendamentos/consultas-form-agendamentos';
import { ConsultasFormAgendamentosModel } from '../../models/consultas-form-agendametos-model';
import { AgendamentosService } from '../../services/agendamentos-service';
import { TipoAgendamento } from '../../models/agendamentos-model';
import { signal } from '@angular/core';

@Component({
  selector: 'app-vacinas',
  standalone: true,
  imports: [FormsModule, CommonModule, ConsultasFormAgendamentos],
  templateUrl: './vacinas.html',
  styleUrl: './vacinas.scss',
})
export class Vacinas implements OnInit {
  isFormVisible = signal(false);
  selectedAgendamentoDto: ConsultasFormAgendamentosModel | undefined;
  tipoAgendamento = TipoAgendamento.VACINA;

  constructor(private agendamentoService: AgendamentosService) {}

  ngOnInit(): void {
    this.isFormVisible.set(false);
  }

  openForm(): void {
    this.selectedAgendamentoDto = undefined;
    this.isFormVisible.set(true);
  }

  onCancelar(): void {
    this.isFormVisible.set(false);
    this.selectedAgendamentoDto = undefined;
  }

  onSalvar(agendamento: ConsultasFormAgendamentosModel): void {
    console.log('Vacina agendada:', agendamento);
  }
}
