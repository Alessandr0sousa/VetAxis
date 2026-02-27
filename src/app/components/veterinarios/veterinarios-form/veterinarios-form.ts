import { Location } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { EspecialidadeVeterinaria, VeterinarioModel } from '../../models/veterinario-model';
import { Customservice } from '../../services/customservice';
import { UserProfileService } from '../../services/user-profile-service';
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
    private userProfileService: UserProfileService
  ) {
    super(fb, viaCep, customService, cdr, location);
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
      clinicaId: [this.userProfileService.getUserProfile()?.clinicaId],
    });
  }
}
