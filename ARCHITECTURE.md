# Arquitetura Baseline - VetAxis

## Visão Geral

Esta é a arquitetura baseline do projeto VetAxis, organizada em camadas para facilitar manutenção, testabilidade e escalabilidade.

## Estrutura de Pastas

```
src/app/
├── core/                           # Núcleo da aplicação (singleton, carregado uma vez)
│   ├── models/                     # Entidades de domínio e interfaces
│   │   ├── entities/              # Entidades principais (Pet, Cliente, Veterinario)
│   │   ├── dtos/                  # Data Transfer Objects
│   │   └── enums/                 # Enumerações do sistema
│   ├── services/                   # Serviços globais singleton
│   └── constants/                  # Constantes da aplicação
│
├── features/                       # Módulos de funcionalidades (lazy-loaded)
│   ├── agendamentos/
│   │   ├── models/                # Models específicos do módulo
│   │   ├── services/              # Serviços do módulo
│   │   ├── components/            # Componentes do módulo
│   │   └── pages/                 # Páginas/containers
│   ├── clientes/
│   ├── consultas/
│   ├── veterinarios/
│   ├── estoque/
│   └── financeiro/
│
├── shared/                         # Código compartilhado entre módulos
│   ├── components/                # Componentes reutilizáveis
│   ├── directives/                # Diretivas compartilhadas
│   ├── pipes/                     # Pipes compartilhados
│   └── utils/                     # Funções utilitárias
│
├── infrastructure/                 # Camada de infraestrutura
│   ├── http/                      # Cliente HTTP base e configuração
│   ├── guards/                    # Guards de rota (auth, permissions)
│   ├── interceptors/              # Interceptors HTTP
│   └── storage/                   # Serviços de armazenamento (localStorage, etc)
│
└── layout/                        # Componentes de layout global
    ├── navbar/
    ├── menu/
    └── footer/
```

## Princípios da Arquitetura

### 1. Separação de Responsabilidades

- **Core**: Contém apenas lógica de negócio e modelos de domínio
- **Features**: Módulos independentes por contexto de negócio
- **Shared**: Componentes e utilitários reutilizáveis sem lógica de negócio
- **Infrastructure**: Detalhes técnicos (HTTP, storage, autenticação)

### 2. Organização por Feature

Cada feature é autocontida com seus próprios:
- Models (entidades específicas)
- Services (lógica de negócio)
- Components (UI)
- Pages (containers/rotas)

### 3. Dependências

```
┌─────────────────┐
│   Presentation  │ (Components/Pages)
└────────┬────────┘
         │
┌────────▼────────┐
│   Application   │ (Services/Use Cases)
└────────┬────────┘
         │
┌────────▼────────┐
│     Domain      │ (Models/Entities)
└────────┬────────┘
         │
┌────────▼────────┐
│ Infrastructure  │ (HTTP/Storage)
└─────────────────┘
```

**Regras:**
- Presentation pode chamar Application
- Application pode chamar Domain
- Infrastructure implementa contratos definidos em Domain
- Domain não conhece Infrastructure

### 4. Modelos e DTOs

#### Entidades de Domínio (core/models/entities/)
- Representam conceitos do negócio
- Contêm regras de negócio
- Independentes de infraestrutura

```typescript
// core/models/entities/agendamento.entity.ts
export interface Agendamento {
  id: number;
  dia: string;
  horario: string;
  status: StatusAgendamento;
  // ... lógica de domínio
}
```

#### DTOs (core/models/dtos/)
- Transferência de dados entre camadas
- Validação de entrada/saída
- Mapeamento para/do backend

```typescript
// core/models/dtos/agendamento.dto.ts
export interface AgendamentoDTO {
  veterinarioId: number;
  petId: number;
  dia: string;
  horario: string;
  // ... campos de transferência
}
```

### 5. Services

#### Services de Domínio (features/*/services/)
- Lógica de negócio específica da feature
- Orquestram operações
- Não conhecem detalhes HTTP

#### Services de Infraestrutura (infrastructure/http/)
- Comunicação com backend
- Mapeamento HTTP específico
- Tratamento de erros de rede

### 6. Componentes

#### Smart Components (Pages)
- Containers de rotas
- Gerenciam estado
- Chamam services
- Localização: `features/*/pages/`

#### Dumb Components
- Apenas apresentação
- Recebem dados via `@Input()`
- Emitem eventos via `@Output()`
- Localização: `features/*/components/` ou `shared/components/`

## Padrões de Código

### Nomenclatura

- **Entities**: `*.entity.ts` (ex: `agendamento.entity.ts`)
- **DTOs**: `*.dto.ts` (ex: `create-agendamento.dto.ts`)
- **Services**: `*.service.ts` (ex: `agendamentos.service.ts`)
- **Components**: `*.component.ts` (ex: `agenda.component.ts`)
- **Enums**: `*.enum.ts` (ex: `status-agendamento.enum.ts`)

### Injeção de Dependências

Usar função `inject()` ao invés de constructor injection:

```typescript
import { inject } from '@angular/core';

export class AgendamentosService {
  private http = inject(HttpClient);
  private agendamentosRepo = inject(AgendamentosRepository);
}
```

### Signals

Usar signals para estado reativo:

```typescript
export class AgendaComponent {
  agendamentos = signal<Agendamento[]>([]);
  loading = signal(false);
  
  computed = computed(() => {
    return this.agendamentos().filter(a => a.status === 'CONFIRMADO');
  });
}
```

### Observables

- Usar para operações assíncronas (HTTP)
- Converter para signals quando necessário
- Sempre fazer unsubscribe (ou usar async pipe)

## Migração Gradual

### Estado Atual
```
components/
├── models/          → mover para core/models/
├── services/        → mover para features/*/services/
├── agenda/          → mover para features/agendamentos/
├── clientes/        → mover para features/clientes/
└── ...
```

### Próximos Passos

1. **Fase 1**: Organizar models em core/
2. **Fase 2**: Separar services por feature
3. **Fase 3**: Criar camada de repositórios (infrastructure)
4. **Fase 4**: Implementar DTOs para todas as operações
5. **Fase 5**: Lazy loading de features

## Testing

```
src/
├── app/
│   └── features/
│       └── agendamentos/
│           ├── agendamentos.service.spec.ts
│           └── components/
│               └── agenda.component.spec.ts
```

- Unit tests para services
- Component tests para lógica de apresentação
- Integration tests para fluxos completos

## Referencias

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
