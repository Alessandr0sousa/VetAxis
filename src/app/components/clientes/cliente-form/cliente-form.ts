import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Cliente } from '../../models/cliente';
import { Customservice } from '../../services/customservice';
import { Estado, IbgeService } from '../../services/ibgeservice';
import { ViaCepService } from '../../services/viacepservice';
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
    location: Location
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
    });
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
