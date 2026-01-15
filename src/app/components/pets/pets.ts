import { Component, inject } from '@angular/core';
import { Columns } from '../models/columns';
import { PetService } from '../services/pet-service';
import { Pet } from './../models/pet';
import { GenericList } from './../shared/generic-list/generic-list';
import { PetForm } from './pet-form/pet-form';

@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [GenericList],
  templateUrl: './pets.html',
  styleUrls: ['./pets.scss'],
})
export class Pets {
  petService = inject(PetService);
  petForm = PetForm;
  icone = 'fa-solid fa-paw fa-2xl';

  petColumns: Columns<Pet>[] = [
    { header: 'Nome', field: 'nome' },
    { header: 'Espécie', field: 'especie' },
    { header: 'Status', field: (p: Pet) => (p.status ? 'Ativo' : 'Inativo') },
    { header: 'Responsável', field: 'cliente.nome' },
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
        {
          type: 'consultar',
          class: 'btn btn-sm',
          icon: 'fa-solid fa-stethoscope info',
          title: 'Consultar',
          callback: '',
        },
      ],
    },
  ];

  filtrarPets(pet: Pet, filtro: string): boolean {
    const f = filtro.toLowerCase();
    return (
      pet.nome.toLowerCase().includes(f) ||
      pet.especie.toLowerCase().includes(f) ||
      (pet.cliente?.nome?.toLowerCase().includes(f) ?? false)
    );
  }

  calcularIdade(dataNascimento: string): string {
    if (!dataNascimento) return '-';
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();

    let anos = hoje.getFullYear() - nascimento.getFullYear();
    let meses = hoje.getMonth() - nascimento.getMonth();

    if (meses < 0 || (meses === 0 && hoje.getDate() < nascimento.getDate())) {
      anos--;
      meses += 12;
    }
    return anos > 0 ? `${anos} ano(s) e ${meses} mês(es)` : `${meses} mês(es)`;
  }
}
