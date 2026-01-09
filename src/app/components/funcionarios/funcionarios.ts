import { FuncionarioModel } from './../models/funcionario-model';
import { FuncionarioService } from './../services/funcionario-service';
import { Component, inject } from '@angular/core';
import { GenericList } from '../shared/generic-list/generic-list';
import { FuncionariosForm } from './funcionarios-form/funcionarios-form';

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [GenericList],
  templateUrl: './funcionarios.html',
  styleUrl: './funcionarios.scss',
})
export class Funcionarios {
  funcionarioService = inject(FuncionarioService);
  funcionariosForm = FuncionariosForm;
  icone = "fa-solid fa-users fa-2xl";

  funcionarioColumns: { header: string; field: keyof FuncionarioModel }[] = [
    { header: 'Nome', field: 'nome' },
    { header: 'CPF', field: 'cpf' },
    { header: 'Telefone', field: 'telefone' },
    { header: 'E-mail', field: 'email' },
    { header: 'Cargo', field: 'cargo' }
  ];

  filtrarFuncionarios(func: FuncionarioModel, filtro: string): boolean {
      const f = filtro.toLowerCase();
      return (
        func.nome.toLowerCase().includes(f) ||
        func.telefone.includes(f) ||
        func.email.toLowerCase().includes(f) ||
        func.cpf.toLowerCase().includes(f) ||
        func.cargo.toLowerCase().includes(f)
      );
    }
}
