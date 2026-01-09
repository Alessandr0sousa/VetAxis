import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EspecialidadeVeterinaria } from '../../models/veterinario-model';
import { Customservice } from '../../services/customservice';
import { ViaCepService } from '../../services/viacepservice';
import { VeterinarioModel } from './../../models/veterinario-model';
import { BaseForm } from '../../models/base-form';

@Component({
  selector: 'app-veterinarios-form',
  imports: [ReactiveFormsModule],
  templateUrl: './veterinarios-form.html',
  styleUrl: './veterinarios-form.scss',
})
export class VeterinariosForm implements BaseForm<VeterinarioModel> {
  @Input() vetDto?: VeterinarioModel;

  @Output() salvar = new EventEmitter<VeterinarioModel>();
  @Output() cancelar = new EventEmitter<void>();

  vetForm!: FormGroup;
  especialidades = Object.values(EspecialidadeVeterinaria);

  constructor(
    private fb: FormBuilder,
    private viaCep: ViaCepService,
    private customService: Customservice,
    private cdr: ChangeDetectorRef
  ) {
    this.vetForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
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
    });
  }

  ngOnChanges(): void {
    if (this.vetDto) {
      this.vetForm.patchValue(this.vetDto);
      this.cdr.detectChanges();
    } else {
      this.vetForm.reset();
    }
  }

  private limparCampo(valor: string): string {
    return valor ? valor.replace(/\D/g, '') : '';
  }

  buscarEnderecoPorCep() {
    let cep = this.vetForm.get('endereco.cep')?.value;
    cep = this.limparCampo(cep);
    if (cep && cep.length === 8) {
      this.viaCep.buscarCep(cep).subscribe((dados) => {
        if (!dados.erro) {
          this.vetForm.patchValue({
            endereco: {
              logradouro: dados.logradouro,
              bairro: dados.bairro,
              cidade: dados.localidade,
              uf: dados.uf,
            },
          });
        }
      });
    }
  }

  salvarVet() {
    // pega os valores crus do form
    let cep = this.vetForm.get('endereco.cep')?.value;
    let cpf = this.vetForm.get('cpf')?.value;
    let tel = this.vetForm.get('telefone')?.value;

    // aplica limpeza
    cep = this.limparCampo(cep);
    cpf = this.limparCampo(cpf);
    tel = this.limparCampo(tel);

    if (this.vetForm.valid) {
      const vetAtualizado: VeterinarioModel = {
        ...(this.vetDto ?? {}),
        ...this.vetForm.value,
        endereco: {
          ...this.vetForm.value.endereco,
          cep: cep,
        },
        cpf: cpf,
        telefone: tel,
      };
      this.salvar.emit(vetAtualizado);
    }
  }

  cancelaVet() {
    this.vetForm.reset();
    this.cancelar.emit();
  }

  formatarCampo(event: any) {
    let valor = event.target.value;
    valor = valor.replace(/\D/g, '');

    const tipo = event.target.getAttribute('formControlName');
    const grupo = event.target.closest('[formGroupName]')?.getAttribute('formGroupName');
    const caminho = grupo ? `${grupo}.${tipo}` : tipo;

    const formatadores: Record<string, (v: string) => string> = {
      telefone: this.customService.formatarTelefone.bind(this.customService),
      cpf: this.customService.formatarCPF.bind(this.customService),
      cep: this.customService.formatarCEP.bind(this.customService),
    };

    const formatador = formatadores[tipo];
    const formatado = formatador ? formatador(valor) : valor;

    this.vetForm.get(caminho)?.setValue(formatado, { emitEvent: false });
  }
}
