# Exemplo de Uso - Nova Arquitetura Baseline

Este arquivo mostra exemplos práticos de como usar a nova arquitetura.

## 📁 Estrutura Criada

```
✅ src/app/
   ✅ core/
      ✅ models/           - Entidades, enums, interfaces
      ✅ services/         - Services globais (vazio por enquanto)
      ✅ constants/        - Constantes (vazio por enquanto)
   
   ✅ features/
      ✅ agendamentos/     - Feature completa de exemplo
         ✅ models/        - DTOs
         ✅ services/      - AgendamentosService
   
   ✅ shared/
      ✅ components/       - Componentes reutilizáveis (vazio)
      ✅ utils/            - Utilitários (vazio)
   
   ✅ infrastructure/
      ✅ http/             - HttpService base
      ✅ guards/           - Auth guards
      ✅ interceptors/     - HTTP interceptors
   
   ⚠️ layout/              - (precisa criar/mover)
```

## 🎯 Exemplo 1: Usando Imports com Path Aliases

### ❌ Antes (caminhos relativos complexos)

```typescript
import { ConsultasFormAgendamentosModel } from '../../../models/consultas-form-agendametos-model';
import { TipoAgendamento } from '../../../models/agendamentos-model';
import { AgendamentosService } from '../../../services/agendamentos-service';
import { StatusAgendamento } from '../../../models/consulta-model';
```

### ✅ Depois (path aliases limpos)

```typescript
// Models e enums do core
import { 
  AgendamentoCompleto, 
  TipoAgendamento, 
  StatusAgendamento,
  Page
} from '@core/models';

// Service da feature
import { AgendamentosService } from '@features/agendamentos';

// Infrastructure
import { authGuard } from '@infrastructure/guards';
```

## 🎯 Exemplo 2: Criando um Component com Nova Arquitetura

```typescript
// features/agendamentos/pages/agenda/agenda.component.ts
import { Component, OnInit, signal, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

// Imports usando path aliases
import { 
  AgendamentoCompleto, 
  TipoAgendamento, 
  StatusAgendamento,
  STATUS_BADGE_CLASS 
} from '@core/models';

import { AgendamentosService } from '@features/agendamentos';

@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AgendaComponent implements OnInit {
  // Injeção usando função inject()
  private agendamentosService = inject(AgendamentosService);

  // Estado reativo com signals
  agendamentos = signal<AgendamentoCompleto[]>([]);
  loading = signal(false);
  erro = signal<string | null>(null);

  // Computeds para dados derivados
  consultas = computed(() => 
    this.agendamentos().filter(a => a.tipoAgendamento === TipoAgendamento.CONSULTA)
  );

  cirurgias = computed(() =>
    this.agendamentos().filter(a => a.tipoAgendamento === TipoAgendamento.CIRURGIA)
  );

  totalAgendamentos = computed(() => this.agendamentos().length);

  // Enums disponíveis no template
  StatusAgendamento = StatusAgendamento;
  TipoAgendamento = TipoAgendamento;

  ngOnInit() {
    this.carregarAgendamentos();
  }

  carregarAgendamentos() {
    this.loading.set(true);
    this.erro.set(null);

    const hoje = new Date().toISOString().split('T')[0];

    this.agendamentosService.buscarPorDia(hoje).subscribe({
      next: (page) => {
        // Normaliza status antes de armazenar
        const normalizados = page.content.map(a => 
          this.agendamentosService.normalizarStatus(a)
        );
        this.agendamentos.set(normalizados);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar agendamentos', err);
        this.erro.set('Falha ao carregar agendamentos');
        this.loading.set(false);
      }
    });
  }

  confirmarAgendamento(id: number, tipo?: string) {
    this.agendamentosService.confirmar(id, tipo).subscribe({
      next: () => {
        console.log('✅ Agendamento confirmado');
        this.carregarAgendamentos();
      },
      error: (err) => console.error('❌ Erro ao confirmar', err)
    });
  }

  cancelarAgendamento(id: number, tipo?: string) {
    this.agendamentosService.cancelar(id, tipo).subscribe({
      next: () => {
        console.log('✅ Agendamento cancelado');
        this.carregarAgendamentos();
      },
      error: (err) => console.error('❌ Erro ao cancelar', err)
    });
  }

  getClasseBadge(status: string): string {
    return STATUS_BADGE_CLASS[status as StatusAgendamento] || 'badge bg-secondary';
  }
}
```

## 🎯 Exemplo 3: Criando um Novo Service

```typescript
// features/clientes/services/clientes.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@infrastructure/http';
import { Page } from '@core/models';

// Models locais da feature
export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco?: string;
}

export interface CreateClienteDTO {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ClientesService extends HttpService {
  // Define o endpoint
  protected override endpoint = 'clientes';

  /**
   * Buscar cliente por ID
   */
  buscarPorId(id: number): Observable<Cliente> {
    return this.findById<Cliente>(id);
  }

  /**
   * Listar todos os clientes com paginação
   */
  listar(page: number = 0, size: number = 20): Observable<Page<Cliente>> {
    return this.findAll<Cliente>({
      page,
      size,
      sort: [{ field: 'nome', direction: 'asc' }]
    });
  }

  /**
   * Buscar cliente por CPF
   */
  buscarPorCpf(cpf: string): Observable<Page<Cliente>> {
    return this.findByField<Cliente>({
      campo: 'cpf',
      valor: cpf,
      page: 0,
      size: 1
    });
  }

  /**
   * Criar novo cliente
   */
  criar(dto: CreateClienteDTO): Observable<Cliente> {
    return this.create<Cliente, CreateClienteDTO>(dto);
  }

  /**
   * Atualizar cliente
   */
  atualizar(id: number, dto: Partial<CreateClienteDTO>): Observable<Cliente> {
    return this.update<Cliente>(id, dto);
  }

  /**
   * Remover cliente
   */
  remover(id: number): Observable<void> {
    return this.remove(id);
  }
}
```

## 🎯 Exemplo 4: Usando Guards nas Rotas

```typescript
// app.routes.ts
import { Routes } from '@angular/router';

// Imports com path aliases
import { authGuard, loginRedirectGuard } from '@infrastructure/guards';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login').then(m => m.Login),
    canActivate: [loginRedirectGuard], // Redireciona se já logado
  },
  {
    path: '',
    canActivateChild: [authGuard], // Protege todas as rotas filhas
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'agenda',
        loadComponent: () => import('./components/agenda/agenda').then(m => m.Agenda),
      },
      {
        path: 'clientes',
        loadComponent: () => import('./components/clientes/clientes').then(m => m.Clientes),
      },
      // ... outras rotas
    ]
  }
];
```

## 🎯 Exemplo 5: Configurando Interceptors

```typescript
// app.config.ts
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';

// Import do interceptor
import { authInterceptor } from '@infrastructure/interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor]) // Registra interceptor
    )
  ]
};
```

## 🎯 Exemplo 6: Template Usando Signals

```html
<!-- agenda.component.html -->
<div class="container">
  <h1>Agenda do Dia</h1>

  <!-- Loading state -->
  @if (loading()) {
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Carregando...</span>
    </div>
  }

  <!-- Error state -->
  @if (erro()) {
    <div class="alert alert-danger">{{ erro() }}</div>
  }

  <!-- Data -->
  @if (!loading() && !erro()) {
    <div class="stats mb-3">
      <span class="badge bg-primary">Total: {{ totalAgendamentos() }}</span>
      <span class="badge bg-info">Consultas: {{ consultas().length }}</span>
      <span class="badge bg-warning">Cirurgias: {{ cirurgias().length }}</span>
    </div>

    <!-- Lista de consultas -->
    <h2>Consultas</h2>
    @for (consulta of consultas(); track consulta.id) {
      <div class="card mb-2">
        <div class="card-body">
          <h5>{{ consulta.nome }}</h5>
          <p>{{ consulta.horario }} - Pet: {{ consulta.pet.nome }}</p>
          <span [class]="getClasseBadge(consulta.status || '')">
            {{ consulta.status || 'AGENDADO' }}
          </span>

          <!-- Ações -->
          @if (!consulta.status || consulta.status === StatusAgendamento.AGENDADO) {
            <div class="btn-group mt-2">
              <button 
                class="btn btn-sm btn-success" 
                (click)="confirmarAgendamento(consulta.id, consulta.tipoAgendamento)">
                Confirmar
              </button>
              <button 
                class="btn btn-sm btn-danger" 
                (click)="cancelarAgendamento(consulta.id, consulta.tipoAgendamento)">
                Cancelar
              </button>
            </div>
          }
        </div>
      </div>
    } @empty {
      <p class="text-muted">Nenhuma consulta agendada</p>
    }
  }
</div>
```

## 🎯 Exemplo 7: Criando DTOs

```typescript
// features/consultas/models/consulta.dto.ts

/**
 * DTO para criar consulta
 */
export interface CreateConsultaDTO {
  // Dados base
  nome: string;
  veterinarioId: number;
  petId: number;
  clinicaId: number;
  dia: string;
  horario: string;
  peso: number;
  
  // Dados específicos de consulta
  anamnese?: string;
  exameFisico?: string;
  diagnostico?: string;
  tratamento?: string;
  prescricao?: string;
  internamento?: boolean;
  
  // Retorno
  isRetorno?: boolean;
  consultaOrigemId?: number;
}

/**
 * DTO para atualizar consulta
 */
export interface UpdateConsultaDTO extends Partial<CreateConsultaDTO> {
  id: number;
  status?: string;
}

/**
 * DTO de resposta do backend
 */
export interface ConsultaResponseDTO {
  id: number;
  nome: string;
  veterinario: {
    id: number;
    nome: string;
  };
  pet: {
    id: number;
    nome: string;
  };
  dia: string;
  horario: string;
  status: string;
  // ... outros campos
}
```

## 📚 Resumo de Imports

```typescript
// ✅ Boas práticas de imports

// Core (models, enums, interfaces base)
import { BaseEntity, Page, TipoAgendamento, StatusAgendamento } from '@core/models';

// Features (services específicos de domínio)
import { AgendamentosService, CreateAgendamentoDTO } from '@features/agendamentos';
import { ClientesService } from '@features/clientes';

// Infrastructure (guards, interceptors, http base)
import { HttpService } from '@infrastructure/http';
import { authGuard, loginRedirectGuard } from '@infrastructure/guards';
import { authInterceptor } from '@infrastructure/interceptors';

// Shared (componentes e utils reutilizáveis)
import { FormatDatePipe } from '@shared/pipes';
import { ConfirmDialogComponent } from '@shared/components';

// Environments
import { environment } from '@env/environment';
```

## 🚀 Próximos Passos

1. **Teste o service novo**: Use `AgendamentosService` em um componente
2. **Crie mais features**: Replique padrão para clientes, consultas, etc
3. **Migre gradualmente**: Um arquivo por vez
4. **Documente**: Atualize este arquivo com seus próprios exemplos

## 💡 Dicas de Uso

- ✅ Sempre use path aliases ao invés de caminhos relativos
- ✅ Crie DTOs para todas operações com backend
- ✅ Use signals para estado reativo
- ✅ Estenda `HttpService` para novos services
- ✅ Mantenha DTOs na feature, entities no core
- ✅ Use `inject()` ao invés de constructor injection

---

**Mais exemplos?** Consulte [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) e [ARCHITECTURE.md](./ARCHITECTURE.md)
