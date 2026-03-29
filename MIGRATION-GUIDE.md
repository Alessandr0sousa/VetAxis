# Guia de Migração - Arquitetura Baseline

## ✅ O que Foi Criado

### 1. Estrutura de Pastas

```
src/app/
├── core/                           ✅ Criado
│   ├── models/                     ✅ Models centralizados
│   ├── services/                   ✅ Services globais
│   └── constants/                  ✅ Constantes
│
├── features/                       ✅ Criado
│   └── agendamentos/               ✅ Feature de exemplo
│       ├── models/                 ✅ DTOs
│       └── services/               ✅ Service específico
│
├── shared/                         ✅ Criado
│   ├── components/                 ✅ Componentes reutilizáveis
│   └── utils/                      ✅ Utilitários
│
├── infrastructure/                 ✅ Criado
│   ├── http/                       ✅ HTTP Service base
│   ├── guards/                     ⚠️ Mover de 'guards/'
│   └── interceptors/               ⚠️ Mover de 'interceptors/'
│
└── layout/                         ⚠️ Precisa criar
    ├── navbar/                     ⚠️ Mover de 'components/navbar/'
    └── menu-principal/             ⚠️ Mover de 'components/menu-principal/'
```

### 2. Modelos Core (✅ Pronto)

- `base.entity.ts` - Entidade base
- `enums.ts` - Enumerações (TipoAgendamento, StatusAgendamento, etc)
- `page.model.ts` - Interface de paginação
- `agendamento.entity.ts` - Entidades de agendamento
- `index.ts` - Barril de exportações

### 3. HTTP Service Base (✅ Pronto)

`infrastructure/http/http.service.ts` - Service abstrato com métodos:
- `findById()` - GET por ID
- `findAll()` - GET com paginação
- `findByField()` - GET com busca
- `create()` - POST
- `update()` - PUT
- `patch()` - PATCH
- `remove()` - DELETE

### 4. Feature de Exemplo (✅ Pronto)

`features/agendamentos/` - Implementação completa:
- DTOs para create/update
- Service estendendo HttpService
- Métodos específicos de negócio

### 5. Path Aliases (✅ Configurado)

```typescript
import { BaseEntity } from '@core/models';
import { AgendamentosService } from '@features/agendamentos';
import { HttpService } from '@infrastructure/http';
```

## 🔄 Como Migrar o Código Existente

### Passo 1: Atualizar Imports nos Components

#### Antes:
```typescript
import { ConsultasFormAgendamentosModel } from '../models/consultas-form-agendametos-model';
import { AgendamentosService } from '../services/agendamentos-service';
import { TipoAgendamento } from '../models/agendamentos-model';
```

#### Depois:
```typescript
import { AgendamentoCompleto, TipoAgendamento } from '@core/models';
import { AgendamentosService } from '@features/agendamentos';
```

### Passo 2: Usar Novo Service (Opcional - Coexistência)

Você pode manter os services antigos funcionando enquanto migra gradualmente:

```typescript
// components/agenda/agenda.ts
import { inject } from '@angular/core';

// Novo service (use quando estiver pronto)
import { AgendamentosService as NovoService } from '@features/agendamentos';

// Service antigo (mantenha por enquanto)
import { AgendamentosService as ServiceAntigo } from '../services/agendamentos-service';

export class AgendaComponent {
  // Use qualquer um
  private service = inject(ServiceAntigo); // Atual
  // private service = inject(NovoService); // Quando migrar
}
```

### Passo 3: Migrar Services Gradualmente

Para cada service em `components/services/`:

1. **Criar versão nova** em `features/[dominio]/services/`
2. **Estender HttpService** ao invés de ApiService
3. **Criar DTOs** em `features/[dominio]/models/`
4. **Testar paralelamente**
5. **Atualizar imports** quando estável

#### Exemplo - Migrar ConsultaService:

```typescript
// features/consultas/services/consulta.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from '@infrastructure/http';
import { ConsultaData } from '@core/models';
import { CreateConsultaDTO } from '../models/consulta.dto';

@Injectable({
  providedIn: 'root',
})
export class ConsultaService extends HttpService {
  protected override endpoint = 'agendamentos/consultas';

  criar(dto: CreateConsultaDTO): Observable<ConsultaData> {
    return this.create<ConsultaData, CreateConsultaDTO>(dto);
  }

  atualizar(id: number, dto: Partial<CreateConsultaDTO>): Observable<ConsultaData> {
    return this.update<ConsultaData>(id, dto);
  }
}
```

### Passo 4: Organizar Components por Feature

```
# Mover components para features
components/agenda/          → features/agendamentos/pages/agenda/
components/consultas/       → features/consultas/pages/
components/clientes/        → features/clientes/pages/
components/veterinarios/    → features/veterinarios/pages/
```

### Passo 5: Mover Guards e Interceptors

```bash
# Guards
components/guards/          → infrastructure/guards/

# Interceptors  
components/interceptors/    → infrastructure/interceptors/
```

### Passo 6: Organizar Layout

```bash
# Layout components
components/navbar/          → layout/navbar/
components/menu-principal/  → layout/menu-principal/
```

## 📋 Checklist de Migração

### Imediato (Já Funciona)
- [x] Estrutura de pastas criada
- [x] Models core definidos
- [x] HttpService base implementado
- [x] Feature de agendamentos como exemplo
- [x] Path aliases configurados
- [x] Documentação completa

### Curto Prazo (Recomendado)
- [ ] Mover guards → `infrastructure/guards/`
- [ ] Mover interceptors → `infrastructure/interceptors/`
- [ ] Mover navbar → `layout/navbar/`
- [ ] Mover menu-principal → `layout/menu-principal/`
- [ ] Criar feature `clientes/`
- [ ] Criar feature `consultas/`
- [ ] Criar feature `veterinarios/`

### Médio Prazo (Gradual)
- [ ] Migrar todos os services para features
- [ ] Criar DTOs para todas as operações
- [ ] Remover services antigos após testes
- [ ] Implementar lazy loading por feature
- [ ] Adicionar testes unitários

### Longo Prazo (Evolução)
- [ ] Implementar state management (signals/store)
- [ ] Adicionar interceptors de logging
- [ ] Implementar cache HTTP
- [ ] Adicionar retry logic
- [ ] Documentar APIs com Swagger

## 🎯 Exemplos de Uso

### Usando Novo Service de Agendamentos

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { inject } from '@angular/core';
import { AgendamentosService } from '@features/agendamentos';
import { AgendamentoCompleto, StatusAgendamento } from '@core/models';

export class AgendaComponent implements OnInit {
  private agendamentosService = inject(AgendamentosService);
  
  agendamentos = signal<AgendamentoCompleto[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.carregarAgendamentos();
  }

  carregarAgendamentos() {
    this.loading.set(true);
    const hoje = new Date().toISOString().split('T')[0];
    
    this.agendamentosService.buscarPorDia(hoje).subscribe({
      next: (page) => {
        // Normaliza status antes de exibir
        const normalizados = page.content.map(a => 
          this.agendamentosService.normalizarStatus(a)
        );
        this.agendamentos.set(normalizados);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar', err);
        this.loading.set(false);
      }
    });
  }

  confirmar(id: number) {
    this.agendamentosService.confirmar(id).subscribe({
      next: () => this.carregarAgendamentos()
    });
  }

  cancelar(id: number) {
    this.agendamentosService.cancelar(id).subscribe({
      next: () => this.carregarAgendamentos()
    });
  }
}
```

### Criando Novo Agendamento

```typescript
import { CreateAgendamentoDTO } from '@features/agendamentos';

criarConsulta() {
  const dto: CreateAgendamentoDTO = {
    nome: 'Consulta de Rotina',
    veterinarioId: 1,
    petId: 5,
    clinicaId: 1,
    dia: '2026-03-10',
    horario: '14:00',
    peso: 5.2,
    tipoAgendamento: 'CONSULTA',
    anamnese: 'Animal apresentando...',
    exameFisico: 'Exame físico normal',
  };

  this.agendamentosService.criar(dto).subscribe({
    next: (criado) => console.log('Criado:', criado),
    error: (err) => console.error('Erro:', err)
  });
}
```

### Usando Enums do Core

```typescript
import { StatusAgendamento, STATUS_BADGE_CLASS } from '@core/models';

getClasseBadge(status: string): string {
  return STATUS_BADGE_CLASS[status as StatusAgendamento] || 'badge bg-secondary';
}
```

## 🔧 Troubleshooting

### Erro: "Cannot find module '@core/models'"

**Solução:** Recarregue o TypeScript server no VS Code:
- `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

### Erro: "Module has no exported member"

**Solução:** Verifique os arquivos `index.ts` (barris de exportação):
```typescript
// Certifique-se de exportar tudo necessário
export * from './base.entity';
export * from './enums';
```

### Imports Circulares

**Solução:** Use barrel exports com cuidado:
- Não importe do barrel dentro do mesmo módulo
- Importe diretamente o arquivo específico

## 📚 Próximos Passos

1. **Revise a documentação**: Leia [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Teste a feature de exemplo**: Use `AgendamentosService` novo
3. **Migre incrementalmente**: Uma feature por vez
4. **Mantenha testes**: Adicione testes para código novo
5. **Documente mudanças**: Atualize README conforme evolui

## 💡 Dicas

- ✅ Use path aliases (`@core`, `@features`) desde o início
- ✅ Mantenha código antigo funcionando durante migração
- ✅ Teste cada migração isoladamente
- ✅ Commits pequenos e incrementais
- ✅ Documente decisões arquiteturais

---

**Dúvidas?** Consulte [ARCHITECTURE.md](./ARCHITECTURE.md) para detalhes completos da arquitetura.
