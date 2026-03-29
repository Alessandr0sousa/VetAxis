import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { StatusInternacao } from '@features/internacoes';
import { getStatusLabel } from '../internacao-ui.utils';

@Component({
  selector: 'app-internacao-modal-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './internacao-modal-status.html',
})
export class InternacaoModalStatus {
  readonly aberto = input.required<boolean>();
  readonly form = input.required<FormGroup>();
  readonly statusPermitidos = input.required<StatusInternacao[]>();

  readonly fechar = output<void>();
  readonly salvar = output<void>();

  onFechar(): void {
    this.fechar.emit();
  }

  onSalvar(): void {
    this.salvar.emit();
  }

  getStatusLabel(status: StatusInternacao): string {
    return getStatusLabel(status);
  }
}
