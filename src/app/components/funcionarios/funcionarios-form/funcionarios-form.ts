import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FuncionarioModel } from '../../models/funcionario-model';
import { ViaCepService } from '@shared/services';
import { Customservice } from '@shared/services';
import { UserProfileService } from '@infrastructure/storage';
import { AlertService } from '@shared/services';
import { FuncionarioService } from '@features/funcionarios';
import { BaseForm } from '../../shared/base-form/base-form';
import { Location } from '@angular/common';


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
    cdr: ChangeDetectorRef,
    location: Location,
    private userProfileService: UserProfileService,
    private alertService: AlertService,
    private funcionarioService: FuncionarioService
  ) {
    super(fb, viaCep, customService, cdr, location);
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
      clinicaId: [this.userProfileService.getClinicaId(), Validators.required],
    });
  }

  override salvarForm(): void {
    const clinicaId = this.userProfileService.getClinicaId();
    this.form.get('clinicaId')?.setValue(clinicaId);

    if (!this.userProfileService.isProfileValid() || clinicaId <= 0) {
      this.alertService.error('Perfil de usuário inválido. Por favor, faça login novamente.');
      return;
    }

    // Verifica se há observers registrados (formulário dentro do GenericList)
    const temObservers = this.salvar['observers']?.length > 0;

    if (temObservers) {
      // Formulário usado dentro do GenericList - emite evento normalmente
      super.salvarForm();
    } else {
      // Formulário standalone - salva diretamente através do serviço
      if (!this.form.valid) {
        this.alertService.error('Preencha todos os campos obrigatórios.');
        return;
      }

      const funcionario: FuncionarioModel = {
        ...this.form.value,
        cpf: this.form.value.cpf.replace(/\D/g, ''),
        telefone: this.form.value.telefone.replace(/\D/g, ''),
        endereco: {
          ...this.form.value.endereco,
          cep: this.form.value.endereco.cep.replace(/\D/g, ''),
        },
      };

      if (funcionario.id) {
        this.funcionarioService.atualizar(funcionario).subscribe({
          next: () => {
            this.alertService.success('Funcionário atualizado com sucesso!');
            this.voltar();
          },
          error: (err) => {
            this.alertService.error(`Erro ao atualizar funcionário: ${err.error?.message || err.message}`);
          },
        });
      } else {
        this.funcionarioService.salvar(funcionario).subscribe({
          next: () => {
            this.alertService.success('Funcionário cadastrado com sucesso!');
            this.voltar();
          },
          error: (err) => {
            if (err.status === 403) {
              this.alertService.error('Acesso negado. Verifique suas permissões.');
            } else if (err.status === 401) {
              this.alertService.error('Sessão expirada. Faça login novamente.');
            } else {
              this.alertService.error(`Erro ao cadastrar: ${err.error?.message || err.message}`);
            }
          },
        });
      }
    }
  }
}
