import { ChangeDetectorRef, Directive, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ViaCepService } from '../../services/viacepservice';
import { Customservice } from '../../services/customservice';
import { Location } from '@angular/common';

@Directive()
export abstract class BaseForm<T> {
  @Input() dto?: T;
  @Output() salvar = new EventEmitter<T>();
  @Output() cancelar = new EventEmitter<void>();

  form!: FormGroup;

  constructor(
    protected fb: FormBuilder,
    protected viaCep: ViaCepService,
    protected customService: Customservice,
    protected cdr: ChangeDetectorRef,
    private location: Location
  ) {}

  /** Cada componente filho deve implementar a construção do formulário */
  protected abstract buildForm(): void;

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(): void {
    if (!this.form) return;
    if (this.dto) {
      this.form.patchValue(this.dto);
      this.cdr.detectChanges();
    } else {
      this.form.reset();
    }
  }

  /** Métodos utilitários comuns */
  protected limparCampo(valor: string): string {
    return valor ? valor.replace(/\D/g, '') : '';
  }

  protected buscarEnderecoPorCep(): void {
    let cep = this.form.get('endereco.cep')?.value;
    cep = this.limparCampo(cep);
    if (cep && cep.length === 8) {
      this.viaCep.buscarCep(cep).subscribe((dados) => {
        if (!dados.erro) {
          this.form.patchValue({
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

  salvarForm(): void {
    if (this.form.valid) {
      // lista de campos que precisam ser limpos
      const camposParaLimpar = ['cpf', 'telefone', 'endereco.cep'];

      const valoresLimpos: Record<string, any> = {};

      for (const campo of camposParaLimpar) {
        const valor = this.form.get(campo)?.value;
        if (valor) {
          valoresLimpos[campo] = this.limparCampo(valor);
        }
      }

      const atualizado: T = {
        ...(this.dto ?? {}),
        ...this.form.value,
        endereco: {
          ...this.form.value.endereco,
          cep: valoresLimpos['endereco.cep'] ?? this.form.value.endereco?.cep,
        },
        cpf: valoresLimpos['cpf'] ?? this.form.value.cpf,
        telefone: valoresLimpos['telefone'] ?? this.form.value.telefone,
      };

      this.salvar.emit(atualizado);
    }
  }

  cancelarForm(): void {
    this.form.reset();
    this.cancelar.emit();
  }

  voltar() {
    this.location.back();
  }

  formatarCampo(event: any): void {
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

    this.form.get(caminho)?.setValue(formatado, { emitEvent: false });
  }
}
