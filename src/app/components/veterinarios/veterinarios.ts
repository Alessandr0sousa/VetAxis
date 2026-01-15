import { VeterinarioModel } from './../models/veterinario-model';
import { Component, inject } from '@angular/core';
import { VeterinarioService } from '../services/veterinario-service';
import { VeterinariosForm } from './veterinarios-form/veterinarios-form';
import { GenericList } from '../shared/generic-list/generic-list';
import { Columns } from '../models/columns';

@Component({
  selector: 'app-veterinarios',
  standalone: true,
  imports: [GenericList],
  templateUrl: './veterinarios.html'
})
export class Veterinarios {
  vetService = inject(VeterinarioService);
  vetForm = VeterinariosForm;
  icone = "fa-solid fa-user-md fa-2xl";

  vetColumns: Columns<VeterinarioModel>[] = [
  { header: 'Nome', field: 'nome' },
  { header: 'CRMV', field: 'crmv' },
  { header: 'Telefone', field: 'telefone' },
  { header: 'E-mail', field: 'email' },
  { header: 'Especialidade', field: 'especialidade' },
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

  filtrarVets(vet: VeterinarioModel, filtro: string): boolean {
    const f = filtro.toLowerCase();
    return (
      vet.nome.toLowerCase().includes(f) ||
      vet.telefone.includes(f) ||
      vet.email.toLowerCase().includes(f) ||
      vet.especialidade.toLowerCase().includes(f) ||
      vet.crmv.includes(f)
    );
  }
}
