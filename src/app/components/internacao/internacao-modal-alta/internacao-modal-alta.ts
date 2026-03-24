import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-internacao-modal-alta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './internacao-modal-alta.html',
})
export class InternacaoModalAlta {
  readonly aberto = input.required<boolean>();
  readonly form = input.required<FormGroup>();

  readonly fechar = output<void>();
  readonly salvar = output<void>();

  onFechar(): void {
    this.fechar.emit();
  }

  onSalvar(): void {
    this.salvar.emit();
  }
}
