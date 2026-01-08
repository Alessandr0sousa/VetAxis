import { Component, OnInit } from '@angular/core';
import { Page } from '../models/page';
import { VeterinarioModel } from './../models/veterinario-model';
import { VeterinarioService } from './../services/veterinario-service';
import { VeterinariosForm } from './veterinarios-form/veterinarios-form';

@Component({
  selector: 'app-veterinarios',
  imports: [VeterinariosForm],
  templateUrl: './veterinarios.html',
  styleUrl: './veterinarios.scss',
})
export class Veterinarios implements OnInit {
  vetDto: VeterinarioModel[] = [];
  vetsFiltrados: VeterinarioModel[] = [];
  vetFormVisible = false;
  vetSelecionado?: VeterinarioModel;
  totalPages: number = 0;
  currentPage: number = 0;

  constructor(private vetservice: VeterinarioService) {}

  ngOnInit(): void {
    this.listarVeterinarios;
  }

  listarVeterinarios(page: number = 0, size: number = 10) {
    this.vetservice.listar(page, size).subscribe((dados: Page<VeterinarioModel>) => {
      this.vetDto = dados.content ?? [];
      this.vetsFiltrados = [...this.vetDto];
      this.totalPages = dados.totalPages;
      this.currentPage = dados.number;
      // this.cdr.detectChanges();
    });
  }

  filtrarVets(event: string) {
    const filtro = event.toLowerCase();
    this.vetsFiltrados = this.vetDto.filter(
      (cli) =>
        cli.nome.toLowerCase().includes(filtro) ||
        cli.telefone.includes(filtro) ||
        cli.email.includes(filtro) ||
        cli.especialidade.toLowerCase().includes(filtro) ||
        cli.crmv.includes(filtro)
    );
  }

  abrirForm() {
    this.vetSelecionado = undefined;
    this.vetFormVisible = true;
  }

  fecharForm() {
    this.vetFormVisible = false;
    this.vetSelecionado = undefined;
  }

  editarVet(id: number) {
    this.vetservice.buscarPorId(id).subscribe({
      next: (vetCompleto) => {
        this.vetSelecionado = vetCompleto;
        this.vetDto = this.vetDto.map((v) => (v.id === id ? vetCompleto : v));
        this.vetsFiltrados = [...this.vetDto];
        this.vetFormVisible = true;
        console.log('vet: ', this.vetSelecionado);
      },
      error: () => {
        alert('Erro ao buscar dados completos do Veterinário.');
      },
    });
  }

  salvarVet(vet: VeterinarioModel) {
    if (vet.id) {
      this.vetservice.atualizar(vet).subscribe({
        next: () => {
          this.listarVeterinarios();
          this.fecharForm();
          alert('Veterinario atualizado com sucesso.');
        },
        error: (err) => {
          alert('Erro ao atualizar veterinario.');
        },
      });
    } else {
      this.vetservice.salvar(vet).subscribe({
        next: () => {
          this.listarVeterinarios();
          this.fecharForm();
          alert('Veterinario salvo com sucesso.');
        },
        error: (err) => {
          if (err.status === 409 || err.error?.message?.includes('CPF já cadastrado')) {
            alert('Este CPF já está cadastrado!');
          } else {
            alert('Erro ao salvar veterinario.');
          }
        },
      });
    }
  }
}
