import { FuncionarioModel } from './../models/funcionario-model';
import { FuncionarioService } from './../services/funcionario-service';
import { Component, inject } from '@angular/core';
import { GenericList } from '../shared/generic-list/generic-list';
import { FuncionariosForm } from './funcionarios-form/funcionarios-form';
import { Columns } from '../models/columns';

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

  funcionarioColumns: Columns<FuncionarioModel>[] = [
    { header: 'Nome', field: 'nome' },
    { header: 'CPF', field: 'cpf' },
    { header: 'Telefone', field: 'telefone' },
    { header: 'E-mail', field: 'email' },
    { header: 'Cargo', field: 'cargo' },
    {
      header: 'Ações',
      actions: [
        {
          type: 'edit',
          class: 'btn btn-sm',
          icon: 'fa-regular fa-pen-to-square warning',
          title: 'Editar',
          callback: '',
        },
      ]
    }
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
