import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Cliente } from '../../models/cliente';
import { Customservice } from '../../services/customservice';
import { Estado, IbgeService } from '../../services/ibgeservice';
import { ViaCepService } from '../../services/viacepservice';
import { UserProfileService } from '../../services/user-profile-service';
import { AlertService } from '../../services/alert-service';
import { ClientesService } from '../../services/clientes-service';
import { BaseForm } from '../../shared/base-form/base-form';
import { Location } from '@angular/common';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cliente-form.html',
  styleUrls: ['./cliente-form.scss'],
})
export class ClienteForm extends BaseForm<Cliente> {
  estados: Estado[] = [];
  municipios: any[] = [];

  constructor(
    private ibgeService: IbgeService,
    fb: FormBuilder,
    viaCep: ViaCepService,
    customService: Customservice,
    cdr: ChangeDetectorRef,
    location: Location,
    private userProfileService: UserProfileService,
    private alertService: AlertService,
    private clientesService: ClientesService
  ) {
    super(fb, viaCep, customService, cdr, location);

    this.ibgeService.listarEstados().subscribe((dados) => {
      this.estados = dados.sort((a, b) => a.nome.localeCompare(b.nome));
    });
  }

  protected buildForm(): void {
    this.form = this.fb.group({
      nome: ['', Validators.required],
      cpf: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      telefone: ['', [Validators.required, Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.email]],
      endereco: this.fb.group({
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        uf: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(2)]],
        cep: ['', [Validators.minLength(9), Validators.maxLength(9)]],
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

      const cliente: Cliente = {
        ...this.form.value,
        cpf: this.form.value.cpf.replace(/\D/g, ''),
        telefone: this.form.value.telefone.replace(/\D/g, ''),
        endereco: {
          ...this.form.value.endereco,
          cep: this.form.value.endereco.cep.replace(/\D/g, ''),
        },
      };

      if (cliente.id) {
        this.clientesService.atualizar(cliente).subscribe({
          next: () => {
            this.alertService.success('Cliente atualizado com sucesso!');
            this.voltar();
          },
          error: (err) => {
            this.alertService.error(`Erro ao atualizar cliente: ${err.error?.message || err.message}`);
          },
        });
      } else {
        this.clientesService.salvar(cliente).subscribe({
          next: () => {
            this.alertService.success('Cliente cadastrado com sucesso!');
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

  buscarMunicipiosPorEstado(sigla: string) {
    const estado = this.estados.find((e) => e.sigla === sigla);
    if (estado) {
      this.ibgeService.listarMunicipiosPorEstado(estado.id).subscribe((dados) => {
        this.municipios = dados.sort((a, b) => a.nome.localeCompare(b.nome));
      });
    }
  }
}
