/**
 * Barrel export para services de agendamento
 *
 * Arquitetura de Agendamento Separada por Tipo:
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │              AgendamentosService (Orquestrador)             │
 * │  - Gerencia lista global de agendamentos (BehaviorSubject)  │
 * │  - Coordena criação em 2 passos (tipo específico → base)    │
 * │  - Validação de IDs (veterinário, pet, consultaOrigem)      │
 * └─────────────────────┬───────────────────────────────────────┘
 *                       │
 *          ┌────────────┴────────────┐
 *          │   Chama conforme tipo   │
 *          └────────────┬────────────┘
 *                       │
 *        ┌──────────────┼──────────────┬──────────────┐
 *        │              │              │              │
 *   ┌────▼────┐   ┌────▼────┐   ┌────▼─────┐  ┌────▼─────┐
 *   │Consulta │   │  Exame  │   │ Cirurgia │  │  Vacina  │
 *   │Service  │   │ Service │   │ Service  │  │ Service  │
 *   └─────────┘   └─────────┘   └──────────┘  └──────────┘
 *        │              │              │              │
 *        └──────────────┴──────────────┴──────────────┘
 *                       │
 *            ┌──────────▼──────────┐
 *            │  POST tipo-específico│
 *            │  /agendamentos/{tipo}│
 *            └──────────┬──────────┘
 *                       │
 *            ┌──────────▼──────────┐
 *            │  Retorna ID criado  │
 *            └──────────┬──────────┘
 *                       │
 *            ┌──────────▼──────────┐
 *            │  POST agendamento   │
 *            │  /agendamentos      │
 *            │  com {tipoId}       │
 *            └─────────────────────┘
 *
 * Fluxo de Criação:
 * 1. Component chama AgendamentosService.salvar{Tipo}()
 * 2. Valida IDs obrigatórios (veterinário, pet)
 * 3. Chama {Tipo}Service.criar() com dados específicos
 * 4. Recebe ID do registro criado via switchMap
 * 5. Cria agendamento base com referência ao tipo
 * 6. Atualiza BehaviorSubject com novo agendamento
 */

export { AgendamentosService } from './agendamentos-service';
export { ConsultaService } from './consulta-service';
export { ExameService } from './exame-service';
export { CirurgiaService } from './cirurgia-service';
export { VacinaService } from './vacina-service';

export type { ConsultaModel } from './consulta-service';
export type { ExameModel } from './exame-service';
export type { CirurgiaModel } from './cirurgia-service';
export type { VacinaModel } from './vacina-service';
