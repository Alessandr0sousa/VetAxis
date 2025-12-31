import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Customservice {

  // Regex padrões
  readonly regexTelefone = /^\(?\d{2}\)?\s?\d{4,5}-\d{4}$/;
  readonly regexCPF = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
  readonly regexCEP = /^\d{5}-\d{3}$/;

  // Validações
  validarTelefone(valor: string): boolean {
    return this.regexTelefone.test(valor);
  }

  validarCPF(valor: string): boolean {
    return this.regexCPF.test(valor);
  }

  validarCEP(valor: string): boolean {
    return this.regexCEP.test(valor);
  }

  // Formatadores
  formatarTelefone(valor: string): string {
    return valor.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  }

  formatarCPF(valor: string): string {
    return valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatarCEP(valor: string): string {
    valor = valor.replace(/(\d{5})(\d{3})/, '$1-$2');
    return valor;
  }
}
