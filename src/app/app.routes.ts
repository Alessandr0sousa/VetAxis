import { Routes } from '@angular/router';

import { Dashboard } from './components/dashboard/dashboard';
import { Clientes } from './components/clientes/clientes';
import { ClienteForm } from './components/clientes/cliente-form/cliente-form';
import { Pets } from './components/pets/pets';
import { PetForm } from './components/pets/pet-form/pet-form';
import { Veterinarios } from './components/veterinarios/veterinarios';
import { VeterinariosForm } from './components/veterinarios/veterinarios-form/veterinarios-form';
import { Funcionarios } from './components/funcionarios/funcionarios';
import { FuncionariosForm } from './components/funcionarios/funcionarios-form/funcionarios-form';
import { Consultas } from './components/consultas/consultas';
import { Internacao } from './components/internacao/internacao';
import { Cadastro } from './components/cadastro/cadastro';
import { Cirurgias } from './components/agenda/cirurgias/cirurgias';
import { Exames } from './components/agenda/exames/exames';
import { Faturamento } from './components/financeiro/faturamento/faturamento';
import { Despesas } from './components/financeiro/despesas/despesas';
import { Comissoes } from './components/financeiro/comissoes/comissoes';
import { Relatorios } from './components/financeiro/relatorios/relatorios';
import { Medicamentos } from './components/estoque/medicamentos/medicamentos';
import { Produtos } from './components/estoque/produtos/produtos';
import { Usuarios } from './components/configuracoes/usuarios/usuarios';
import { Perfis } from './components/configuracoes/perfis/perfis';

export const routes: Routes = [
  { path: '', component: Dashboard, title: 'Dashboard' },
  { path: 'dashboard', component: Dashboard, title: 'Dashboard' },

  { path: 'clientes', component: Clientes, title: 'Clientes' },
  { path: 'cadastro/cliente-form', component: ClienteForm, title: 'Cadastro de Clientes' },

  { path: 'pets', component: Pets, title: 'Pets' },
  { path: 'cadastro/pet-form', component: PetForm, title: 'Cadastro de Pets' },

  { path: 'veterinarios', component: Veterinarios, title: 'Veterinários' },
  { path: 'cadastro/veterinarios-form', component: VeterinariosForm, title: 'Cadastro de Veterinários' },

  { path: 'funcionarios', component: Funcionarios, title: 'Funcionários' },
  { path: 'cadastro/funcionarios-form', component: FuncionariosForm, title: 'Cadastro de Funcionários' },

  { path: 'consultas', component: Consultas, title: 'Consultas' },
  { path: 'internacao', component: Internacao, title: 'Internação' },

  { path: 'cadastro', component: Cadastro, title: 'Cadastro' },

  { path: 'agenda/cirurgias', component: Cirurgias, title: 'Cirurgias' },
  { path: 'agenda/exames', component: Exames, title: 'Exames' },

  { path: 'financeiro/faturamento', component: Faturamento, title: 'Faturamento' },
  { path: 'financeiro/despesas', component: Despesas, title: 'Despesas' },
  { path: 'financeiro/comissoes', component: Comissoes, title: 'Comissões' },
  { path: 'financeiro/relatorios', component: Relatorios, title: 'Relatórios' },

  { path: 'estoque/medicamentos', component: Medicamentos, title: 'Medicamentos' },
  { path: 'estoque/produtos', component: Produtos, title: 'Produtos' },

  { path: 'configuracoes/usuarios', component: Usuarios, title: 'Usuários' },
  { path: 'configuracoes/perfis', component: Perfis, title: 'Perfis de Acesso' },

  { path: '**', redirectTo: 'dashboard' }, // rota fallback
];
