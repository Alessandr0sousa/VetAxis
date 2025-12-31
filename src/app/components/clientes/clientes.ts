import { HttpClientModule } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { Cliente } from '../models/cliente';
import { ClientesService } from '../services/clientes-service';
import { ClienteForm } from './cliente-form/cliente-form';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HttpClientModule, ClienteForm],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.scss'],
})
export class Clientes implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  clientFormVisible = false;
  clienteSelecionado?: number;
  totalPages: number = 0;
  currentPage: number = 0;

  constructor(private clientesService: ClientesService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.listarClientes();
  }

  listarClientes(page: number = 0, size: number = 10) {
    this.clientesService.listar(page, size).subscribe((dados: any) => {
      this.clientes = dados.content ?? [];
      this.clientesFiltrados = [...this.clientes];
      this.totalPages = dados.totalPages;
      this.currentPage = dados.number;
      this.cdr.detectChanges();
    });
  }

  get clienteSelecionadoObj(): Cliente | undefined {
    return this.clientes.find((c) => c.id === this.clienteSelecionado);
  }

  filtrarClientes(event: string) {
    const filtro = event.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(
      (cli) =>
        cli.nome.toLowerCase().includes(filtro) ||
        cli.telefone.includes(filtro) ||
        cli.email.toLowerCase().includes(filtro) ||
        cli.cpf.includes(filtro)
    );
  }

  abrirForm() {
    this.clienteSelecionado = undefined;
    this.clientFormVisible = true;
  }

  fecharForm() {
    this.clientFormVisible = false;
    this.clienteSelecionado = undefined;
  }

  editarCliente(id: number) {
    this.clientesService.buscarPorId(id).subscribe({
      next: (clienteCompleto) => {
        this.clienteSelecionado = clienteCompleto.id;
        this.clientes = this.clientes.map((c) => (c.id === id ? clienteCompleto : c));
        this.clientesFiltrados = [...this.clientes];
        this.clientFormVisible = true;
      },
      error: () => {
        alert('Erro ao buscar dados completos do cliente.');
      },
    });
  }

  salvarCliente(cliente: Cliente) {
    if (cliente.id) {
      this.clientesService.atualizar(cliente).subscribe({
        next: () => {
          this.listarClientes();
          this.fecharForm();
        },
        error: (err) => {
          alert('Erro ao atualizar cliente.');
        },
      });
    } else {
      this.clientesService.salvar(cliente).subscribe({
        next: () => {
          this.listarClientes();
          this.fecharForm();
        },
        error: (err) => {
          if (err.status === 409 || err.error?.message?.includes('CPF já cadastrado')) {
            alert('Este CPF já está cadastrado!');
          } else {
            alert('Erro ao salvar cliente.');
          }
        },
      });
    }
  }
}
