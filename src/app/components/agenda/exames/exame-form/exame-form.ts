import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConsultasFormAgendamentosModel } from '../../../models/consultas-form-agendametos-model';

@Component({
  selector: 'app-exame-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exame-form.html',
})
export class ExameForm implements OnInit {
  @Input() agendamento?: ConsultasFormAgendamentosModel;
  @Output() cancelar = new EventEmitter<void>();
  @Output() atendimentoConcluido = new EventEmitter<ConsultasFormAgendamentosModel>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    tipo: ['', Validators.required],
    descricao: ['', Validators.required],
    materialColetado: [''],
    achados: [''],
    laudo: [''],
  });

  ngOnInit(): void {
    if (!this.agendamento) return;

    this.form.patchValue({
      tipo: this.agendamento.tipo ?? '',
      descricao: this.agendamento.descricao ?? '',
      materialColetado: this.agendamento.materialColetado ?? '',
      achados: this.agendamento.achados ?? '',
      laudo: this.agendamento.laudo ?? '',
    });
  }

  salvar(): void {
    if (!this.agendamento || this.form.invalid) return;

    const atualizado: ConsultasFormAgendamentosModel = {
      ...this.agendamento,
      tipo: this.form.value.tipo ?? '',
      descricao: this.form.value.descricao ?? '',
      materialColetado: this.form.value.materialColetado ?? '',
      achados: this.form.value.achados ?? '',
      laudo: this.form.value.laudo ?? '',
      status: 'REALIZADO',
      statusExame: 'REALIZADO',
    } as ConsultasFormAgendamentosModel;

    this.atendimentoConcluido.emit(atualizado);
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
