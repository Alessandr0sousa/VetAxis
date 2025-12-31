import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cliente } from '../../models/cliente';
import { Customservice } from '../../services/customservice';
import { Estado, IbgeService } from '../../services/ibgeservice';
import { ViaCepService } from '../../services/viacepservice';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './cliente-form.html',
  styleUrls: ['./cliente-form.scss'],
})
export class ClienteForm {
  @Input() cliente?: Cliente;
  @Output() cancelar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<Cliente>();

  clienteForm: FormGroup;
  petFormVisible = false;
  estados: Estado[] = [];
  municipios: any[] = [];

  constructor(
    private fb: FormBuilder,
    private viaCep: ViaCepService,
    private ibgeService: IbgeService,
    private customService: Customservice
  ) {
    this.clienteForm = this.fb.group({
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
        cep: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(9)]],
      }),
    });

    this.ibgeService.listarEstados().subscribe((dados) => {
      this.estados = dados.sort((a, b) => a.nome.localeCompare(b.nome));
    });
  }

  ngOnChanges(): void {
    if (this.cliente) {
      this.clienteForm.patchValue(this.cliente);
    } else {
      this.clienteForm.reset();
    }
  }

  buscarMunicipiosPorEstado(sigla: string) {
    console.log('Buscando municípios para o estado:', sigla);
    const estado = this.estados.find((e) => e.sigla === sigla);
    if (estado) {
      this.ibgeService.listarMunicipiosPorEstado(estado.id).subscribe((dados) => {
        this.municipios = dados.sort((a, b) => a.nome.localeCompare(b.nome));
      });
    }
  }

  private limparCEP(cep: string): string {
    return cep.replace(/[\s\-]+/g, '');
  }

  buscarEnderecoPorCep() {
    let cep = this.clienteForm.get('endereco.cep')?.value;
    cep = this.limparCEP(cep);
    if (cep && cep.length === 8) {
      this.viaCep.buscarCep(cep).subscribe((dados) => {
        if (!dados.erro) {
          this.clienteForm.patchValue({
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

  salvarCliente() {
    if (this.clienteForm.valid) {
      const clienteAtualizado: Cliente = {
        ...this.cliente,
        ...this.clienteForm.value,
      };
      this.salvar.emit(clienteAtualizado);
    }
  }

  cancelarCliente() {
    this.clienteForm.reset();
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

    this.clienteForm.get(caminho)?.setValue(formatado, { emitEvent: false });
  }
}
