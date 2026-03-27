import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConsultasFormAgendamentosModel } from '../../../models/consultas-form-agendametos-model';

@Component({
  selector: 'app-vacina-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vacina-form.html',
})
export class VacinaForm implements OnInit {
  @Input() agendamento?: ConsultasFormAgendamentosModel;
  @Output() cancelar = new EventEmitter<void>();
  @Output() atendimentoConcluido = new EventEmitter<ConsultasFormAgendamentosModel>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    tipo: ['', Validators.required],
    dose: ['', Validators.required],
    lote: [''],
    fabricante: [''],
    dataValidade: [''],
  });

  ngOnInit(): void {
    if (!this.agendamento) return;

    this.form.patchValue({
      tipo: this.agendamento.tipo ?? '',
      dose: this.agendamento.dose ?? '',
      lote: (this.agendamento as any).lote ?? '',
      fabricante: (this.agendamento as any).fabricante ?? '',
      dataValidade: (this.agendamento as any).dataValidade ?? '',
    });
  }

  salvar(): void {
    if (!this.agendamento || this.form.invalid) return;

    const atualizado: ConsultasFormAgendamentosModel = {
      ...this.agendamento,
      tipo: this.form.value.tipo ?? '',
      dose: this.form.value.dose ?? '',
      lote: this.form.value.lote ?? '',
      fabricante: this.form.value.fabricante ?? '',
      dataValidade: this.form.value.dataValidade ?? '',
      status: 'REALIZADO',
      statusVacina: 'REALIZADO',
    } as ConsultasFormAgendamentosModel;

    this.atendimentoConcluido.emit(atualizado);
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
