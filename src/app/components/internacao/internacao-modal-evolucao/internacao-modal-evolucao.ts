import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { VeterinarioModel } from '../../models/veterinario-model';

@Component({
  selector: 'app-internacao-modal-evolucao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './internacao-modal-evolucao.html',
})
export class InternacaoModalEvolucao {
  readonly aberto = input.required<boolean>();
  readonly form = input.required<FormGroup>();
  readonly veterinarios = input.required<VeterinarioModel[]>();

  readonly fechar = output<void>();
  readonly salvar = output<void>();

  onFechar(): void {
    this.fechar.emit();
  }

  onSalvar(): void {
    this.salvar.emit();
  }
}
