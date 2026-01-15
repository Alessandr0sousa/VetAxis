import { Component, inject } from '@angular/core';
import { GenericList } from '../shared/generic-list/generic-list';
import { Cliente } from './../models/cliente';
import { ClientesService } from '../services/clientes-service';
import { ClienteForm } from './cliente-form/cliente-form';
import { Columns } from '../models/columns';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [GenericList],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.scss'],
})
export class Clientes {
  clienteService = inject(ClientesService);
  clienteForm = ClienteForm;
  icone = "fa-solid fa-user-plus fa-2xl";

  clienteColumns: Columns<Cliente>[] = [
    { header: 'Nome', field: 'nome' },
    { header: 'CPF', field: 'cpf' },
    { header: 'Telefone', field: 'telefone' },
    { header: 'E-mail', field: 'email' },
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

  filtrarClientes(cli: Cliente, filtro: string): boolean {
    const f = filtro.toLowerCase();
    return (
      cli.nome.toLowerCase().includes(f) ||
      cli.telefone.includes(f) ||
      cli.email.toLowerCase().includes(f) ||
      cli.cpf.includes(f)
    );
  }
}
