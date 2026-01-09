import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FuncionarioModel } from '../../models/funcionario-model';
import { ViaCepService } from '../../services/viacepservice';
import { Customservice } from '../../services/customservice';
import { BaseForm } from '../../shared/base-form/base-form';

@Component({
  selector: 'app-funcionarios-form',
  imports: [ReactiveFormsModule],
  templateUrl: './funcionarios-form.html',
  styleUrl: './funcionarios-form.scss',
})
export class FuncionariosForm extends BaseForm<FuncionarioModel> {

  constructor(
    fb: FormBuilder,
    viaCep: ViaCepService,
    customService: Customservice,
    cdr: ChangeDetectorRef
  ) {
    super(fb, viaCep, customService, cdr);
  }

  protected override buildForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      telefone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      cargo: ['', [Validators.required]],
      status: [true],
      endereco: this.fb.group({
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        uf: ['', [Validators.required, Validators.maxLength(2)]],
        cep: ['', Validators.required],
      }),
    });
  }
}
