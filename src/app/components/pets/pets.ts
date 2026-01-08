import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Pet } from '../models/pet';
import { PetService } from '../services/pet-service';
import { PetForm } from './pet-form/pet-form';
import { Page } from '../models/page';
import { Cliente } from '../models/cliente';

@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [PetForm],
  templateUrl: './pets.html',
  styleUrls: ['./pets.scss'],
})
export class Pets implements OnInit {
  pets: Pet[] = [];
  petsFiltrados: Pet[] = [];
  petsFormVisible = false;
  petSelecionado?: Pet;
  totalPages: number = 0;
  currentPage: number = 0;

  constructor(private petService: PetService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.carregarPets();
  }

  carregarPets(page: number = 0, size: number = 10): void {
    this.petService.listar(page, size).subscribe({
      next: (data: Page<Pet>) => {
        this.pets = data?.content ?? []; // garante array
        this.petsFiltrados = [...this.pets];
        this.totalPages = data?.totalPages ?? 0;
        this.currentPage = data?.number ?? 0;
        this.cdr.detectChanges();
        console.info(this.pets);
      },
      error: (err) => {
        console.error('Erro ao carregar pets', err);
        this.pets = []; // evita erro no *ngFor/@for
      },
    });
  }

  filtrarPets(event: string) {
    const filtro = event.toLowerCase();
    this.petsFiltrados = this.pets.filter(
      (pet) =>
        pet.nome.toLowerCase().includes(filtro) ||
        pet.especie.toLowerCase().includes(filtro) ||
        (pet.cliente?.nome?.toLowerCase().includes(filtro) ?? false)
    );
    console.info(this.petsFiltrados);
  }

  excluirPet(id: number): void {
    if (confirm('Deseja realmente excluir este pet?')) {
      this.petService.deletePet(id).subscribe(() => {
        this.pets = this.pets.filter((p) => p.id !== id);
      });
    }
  }

  abrirForm() {
    this.petSelecionado = undefined;
    this.petsFormVisible = true;
  }

  fecharForm() {
    this.petsFormVisible = false;
    this.petSelecionado = undefined;
  }

  editarPet(id: number): void {
    this.petService.getPetById(id).subscribe({
      next: (petCompleto) => {
        this.petSelecionado = petCompleto;
        this.pets = this.pets.map((p) => (p.id === id ? petCompleto : p));
        this.petsFiltrados = [...this.pets];
        this.petsFormVisible = true;
      },
      error: () => {
        alert('Erro ao buscar os dados completos do Pet.');
      },
    });
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

  salvarPet(pet: Pet) {
    if (pet.id) {
      this.petService.atualizar(pet).subscribe({
        next: () => {
          this.carregarPets();
          this.fecharForm();
          alert('Pet atualizado com sucesso!');
        },
        error: () => {
          alert('Erro ao atualizar pet.');
        },
      });
    } else {
      this.petService.salvar(pet).subscribe({
        next: () => {
          this.carregarPets();
          this.fecharForm();
          alert('Pet salvo com sucesso!');
        },
        error: (err) => {
          if (err.status === 409 || err.error?.message?.includes('Pet já cadastrado')) {
            alert('Este pet já está cadastrado!');
          } else {
            alert('Erro ao salvar pet.');
          }
          this.carregarPets();
          this.fecharForm();
        },
      });
    }
  }
}
