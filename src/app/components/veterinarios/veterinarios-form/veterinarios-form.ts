import { Location } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { EspecialidadeVeterinaria, VeterinarioModel } from '../../models/veterinario-model';
import { Customservice } from '../../services/customservice';
import { AlertService } from '../../services/alert-service';
import { UserProfileService } from '../../services/user-profile-service';
import { VeterinarioService } from '../../services/veterinario-service';
import { ViaCepService } from '../../services/viacepservice';
import { BaseForm } from '../../shared/base-form/base-form';

@Component({
  selector: 'app-veterinarios-form',
  imports: [ReactiveFormsModule],
  templateUrl: './veterinarios-form.html',
  styleUrl: './veterinarios-form.scss',
})
export class VeterinariosForm extends BaseForm<VeterinarioModel> {
  especialidades = Object.values(EspecialidadeVeterinaria);

  constructor(
    fb: FormBuilder,
    viaCep: ViaCepService,
    customService: Customservice,
    cdr: ChangeDetectorRef,
    location: Location,
    private userProfileService: UserProfileService,
    private alertService: AlertService,
    private veterinarioService: VeterinarioService
  ) {
    super(fb, viaCep, customService, cdr, location);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      telefone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      crmv: ['', [Validators.required]],
      especialidade: ['', [Validators.required]],
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

      const veterinario: VeterinarioModel = {
        ...this.form.value,
        cpf: this.form.value.cpf.replace(/\D/g, ''),
        telefone: this.form.value.telefone.replace(/\D/g, ''),
        endereco: {
          ...this.form.value.endereco,
          cep: this.form.value.endereco.cep.replace(/\D/g, ''),
        },
      };

      if (veterinario.id) {
        this.veterinarioService.atualizar(veterinario).subscribe({
          next: () => {
            this.alertService.success('Veterinário atualizado com sucesso!');
            this.voltar();
          },
          error: (err) => {
            this.alertService.error(`Erro ao atualizar veterinário: ${err.error?.message || err.message}`);
          },
        });
      } else {
        this.veterinarioService.salvar(veterinario).subscribe({
          next: () => {
            this.alertService.success('Veterinário cadastrado com sucesso!');
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
