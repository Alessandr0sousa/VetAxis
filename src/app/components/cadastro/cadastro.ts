import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem } from '../models/menu-item';
import { ClientesService } from './../services/clientes-service';
import { FuncionarioService } from './../services/funcionario-service';
import { VeterinarioService } from './../services/veterinario-service';
import { PetService } from '../services/pet-service';
import { ListService } from '../models/list-service';
import { DashboardStore } from '../services/dashboard-store';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cadastro.html',
  styleUrls: ['./cadastro.scss'],
})
export class Cadastro implements OnInit {
  menus: MenuItem[] = [
    { label: 'Clientes', icon: 'fa-solid fa-user-plus', routerLink: ['/cadastro/cliente-form'] },
    { label: 'Pets', icon: 'fa-solid fa-paw', routerLink: ['/cadastro/pet-form'] },
    { label: 'Veterinários', icon: 'fa-solid fa-user-md', routerLink: ['/cadastro/veterinarios-form'] },
    { label: 'Funcionários', icon: 'fa-solid fa-users', routerLink: ['/cadastro/funcionarios-form'] },
  ];

  private serviceMap: Record<string, ListService>;
  qtds: any;

  constructor(
    private dashboardStore: DashboardStore,
    private clientesService: ClientesService,
    private petService: PetService,
    private veterinarioService: VeterinarioService,
    private funcionarioService: FuncionarioService
  ) {
    this.serviceMap = {
      clientes: this.clientesService,
      pets: this.petService,
      veterinarios: this.veterinarioService,
      funcionarios: this.funcionarioService,
    };
    this.qtds = this.dashboardStore.qtds;
  }

  ngOnInit(): void {
    this.menus.forEach((menu) => {
      const key = this.slugify(menu.label);
      const service = this.serviceMap[key];
      if (service && this.dashboardStore.getQtd('t' + key) === 0) {
        service.listar(0, 10).subscribe((page: any) => {
          const total = page.totalElements ?? page.page?.totalElements;
          this.dashboardStore.updateQtd('t' + key, total);
        });
      }
    });
  }

  slugify(label: string): string {
    return label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/\s+/g, ''); // remove espaços
  }

  slugifyLink(label: string): string {
    return (
      '/' +
      label
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
    );
  }
}
