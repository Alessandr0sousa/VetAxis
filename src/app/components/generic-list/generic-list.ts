import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Page } from '../models/page';
import { BaseEntity } from '../models/base-entity';

@Component({
  selector: 'app-generic-list',
  standalone: true, // Angular 20
  imports: [CommonModule],
  templateUrl: './generic-list.html',
  styleUrls: ['./generic-list.scss'] // ✅ precisa ser plural
})
export class GenericListComponent<T extends BaseEntity> implements OnInit { // ✅ generics só aqui
  @Input() service!: {
    listar: (page: number, size: number) => any;
    buscarPorId: (id: number) => any;
    salvar: (item: T) => any;
    atualizar: (item: T) => any;
  };

  @Input() formComponent!: any;
  @Input() filtroFn!: (item: T, filtro: string) => boolean;

  data = signal<T[]>([]);
  filtrados = signal<T[]>([]);
  formVisible = signal(false);
  selecionado = signal<T | undefined>(undefined);

  totalPages = signal(0);
  currentPage = signal(0);

  ngOnInit(): void {
    this.listar();
  }

  listar(page: number = 0, size: number = 10) {
    this.service.listar(page, size).subscribe((dados: Page<T>) => {
      this.data.set(dados.content ?? []);
      this.filtrados.set([...this.data()]);
      this.totalPages.set(dados.totalPages);
      this.currentPage.set(dados.number);
    });
  }

  filtrar(event: string) {
    const filtro = event.toLowerCase();
    this.filtrados.set(this.data().filter(item => this.filtroFn(item, filtro)));
  }

  abrirForm() {
    this.selecionado.set(undefined);
    this.formVisible.set(true);
  }

  fecharForm() {
    this.formVisible.set(false);
    this.selecionado.set(undefined);
  }

  editar(id: number) {
    this.service.buscarPorId(id).subscribe({
      next: (item: T) => {
        this.selecionado.set(item);
        this.data.set(this.data().map(v => (v.id === id ? item : v)));
        this.filtrados.set([...this.data()]);
        this.formVisible.set(true);
      },
      error: () => alert('Erro ao buscar dados.')
    });
  }

  salvar(item: T) {
    if (item.id) {
      this.service.atualizar(item).subscribe({
        next: () => {
          this.listar();
          this.fecharForm();
          alert('Atualizado com sucesso.');
        },
        error: () => alert('Erro ao atualizar.')
      });
    } else {
      this.service.salvar(item).subscribe({
        next: () => {
          this.listar();
          this.fecharForm();
          alert('Salvo com sucesso.');
        },
        error: () => alert('Erro ao salvar.')
      });
    }
  }
}
