import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Pet } from '../../models/pet';
import { VeterinarioModel } from '../../models/veterinario-model';
import { OrigemTipo } from '@features/internacoes';

@Component({
  selector: 'app-internacao-modal-admissao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './internacao-modal-admissao.html',
})
export class InternacaoModalAdmissao {
  readonly aberto = input.required<boolean>();
  readonly form = input.required<FormGroup>();
  readonly pets = input.required<Pet[]>();
  readonly veterinarios = input.required<VeterinarioModel[]>();
  readonly origemTipos = input.required<OrigemTipo[]>();

  readonly fechar = output<void>();
  readonly salvar = output<void>();

  onFechar(): void {
    this.fechar.emit();
  }

  onSalvar(): void {
    this.salvar.emit();
  }
}
