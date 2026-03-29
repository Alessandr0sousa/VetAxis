import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConsultasFormAgendamentosModel } from '../../../models/consultas-form-agendametos-model';

@Component({
  selector: 'app-cirurgia-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cirurgia-form.html',
})
export class CirurgiaForm implements OnInit {
  @Input() agendamento?: ConsultasFormAgendamentosModel;
  @Output() cancelar = new EventEmitter<void>();
  @Output() atendimentoConcluido = new EventEmitter<ConsultasFormAgendamentosModel>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    tipo: ['', Validators.required],
    descricao: ['', Validators.required],
    anestesia: [''],
    anestesista: [''],
    protocoloAnestesia: [''],
    relaProcedimento: [''],
    internamento: [false],
  });

  ngOnInit(): void {
    if (!this.agendamento) return;

    this.form.patchValue({
      tipo: this.agendamento.tipo ?? '',
      descricao: this.agendamento.descricao ?? '',
      anestesia: (this.agendamento as any).anestesia ?? '',
      anestesista: (this.agendamento as any).anestesista ?? '',
      protocoloAnestesia: (this.agendamento as any).protocoloAnestesia ?? '',
      relaProcedimento: (this.agendamento as any).relaProcedimento ?? '',
      internamento: (this.agendamento as any).internamento ?? false,
    });
  }

  salvar(): void {
    if (!this.agendamento || this.form.invalid) return;

    const atualizado: ConsultasFormAgendamentosModel = {
      ...this.agendamento,
      tipo: this.form.value.tipo ?? '',
      descricao: this.form.value.descricao ?? '',
      anestesia: this.form.value.anestesia ?? '',
      anestesista: this.form.value.anestesista ?? '',
      protocoloAnestesia: this.form.value.protocoloAnestesia ?? '',
      relaProcedimento: this.form.value.relaProcedimento ?? '',
      internamento: this.form.value.internamento ?? false,
      status: 'REALIZADO',
      statusCirurgia: 'REALIZADO',
    } as ConsultasFormAgendamentosModel;

    this.atendimentoConcluido.emit(atualizado);
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
