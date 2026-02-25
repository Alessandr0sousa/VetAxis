import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultasFormAgendamentos } from '../../consultas/consultas-form-agendamentos/consultas-form-agendamentos';
import { ConsultasFormAgendamentosModel } from '../../models/consultas-form-agendametos-model';
import { AgendamentosService } from '../../services/agendamentos-service';
import { TipoAgendamento } from '../../models/agendamentos-model';
import { signal } from '@angular/core';

@Component({
  selector: 'app-exames',
  standalone: true,
  imports: [FormsModule, CommonModule, ConsultasFormAgendamentos],
  templateUrl: './exames.html',
  styleUrl: './exames.scss',
})
export class Exames implements OnInit {
  isFormVisible = signal(false);
  selectedAgendamentoDto: ConsultasFormAgendamentosModel | undefined;
  tipoAgendamento = TipoAgendamento.EXAME;

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
    console.log('Exame agendado:', agendamento);
  }
}
