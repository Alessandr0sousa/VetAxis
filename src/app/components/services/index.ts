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

export { AgendamentosService } from '@features/agendamentos';
export { ConsultaService } from '@features/agendamentos';
export { ExameService } from '@features/exames';
export { CirurgiaService } from '@features/cirurgias';
export { VacinaService } from '@features/vacinas';

export type { ConsultaModel } from '@features/agendamentos';
export type { ExameModel } from '@features/exames';
export type { CirurgiaModel } from '@features/cirurgias';
export type { VacinaModel } from '@features/vacinas';
