import { Routes } from '@angular/router';

import { Cirurgias } from './components/agenda/cirurgias/cirurgias';
import { Exames } from './components/agenda/exames/exames';
import { ClienteForm } from './components/clientes/cliente-form/cliente-form';
import { Funcionarios } from './components/cadastro/funcionarios/funcionarios';
import { Pets } from './components/pets/pets';
import { Veterinarios } from './components/veterinarios/veterinarios';
import { Clientes } from './components/clientes/clientes';
import { Perfis } from './components/configuracoes/perfis/perfis';
import { Usuarios } from './components/configuracoes/usuarios/usuarios';
import { Consultas } from './components/consultas/consultas';
import { Dashboard } from './components/dashboard/dashboard';
import { Medicamentos } from './components/estoque/medicamentos/medicamentos';
import { Produtos } from './components/estoque/produtos/produtos';
import { Comissoes } from './components/financeiro/comissoes/comissoes';
import { Despesas } from './components/financeiro/despesas/despesas';
import { Faturamento } from './components/financeiro/faturamento/faturamento';
import { Relatorios } from './components/financeiro/relatorios/relatorios';
import { Internacao } from './components/internacao/internacao';
import { PetForm } from './components/pets/pet-form/pet-form';
import { VeterinariosForm } from './components/veterinarios/veterinarios-form/veterinarios-form';

export const routes: Routes = [
  { path: '', component: Dashboard, title: 'Dashboard' },
  { path: 'dashboard', component: Dashboard, title: 'Dashboard' },
  { path: 'clientes', component: Clientes, title: 'Clientes' },
  { path: 'pets', component: Pets, title: 'Pets' },
  { path: 'consultas', component: Consultas, title: 'Consultas' },
  { path: 'internacao', component: Internacao, title: 'Internação' },

  {
    path: 'cadastro',
    children: [
      { path: 'cliente-form', component: ClienteForm, title: 'Cliente Form' },
      { path: 'pet-form', component: PetForm, title: 'Pet Form' },
      { path: 'veterinarios', component: Veterinarios, title: 'Veterinários' },
      { path: 'funcionarios', component: Funcionarios, title: 'Funcionários' }
    ]
  },

  {
    path: 'agenda',
    children: [
      { path: 'cirurgias', component: Cirurgias, title: 'Cirurgias' },
      { path: 'exames', component: Exames, title: 'Exames' }
    ]
  },

  {
    path: 'financeiro',
    children: [
      { path: 'faturamento', component: Faturamento, title: 'Faturamento' },
      { path: 'despesas', component: Despesas, title: 'Despesas' },
      { path: 'comissoes', component: Comissoes, title: 'Comissões' },
      { path: 'relatorios', component: Relatorios, title: 'Relatórios' }
    ]
  },

  {
    path: 'estoque',
    children: [
      { path: 'medicamentos', component: Medicamentos, title: 'Medicamentos' },
      { path: 'produtos', component: Produtos, title: 'Produtos' }
    ]
  },

  {
    path: 'configuracoes',
    children: [
      { path: 'usuarios', component: Usuarios, title: 'Usuários' },
      { path: 'perfis', component: Perfis, title: 'Perfis de Acesso' }
    ]
  },

  { path: '**', redirectTo: 'dashboard' } // rota fallback
];
