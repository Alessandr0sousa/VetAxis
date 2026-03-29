import type {
  Agendamento as CoreAgendamento,
  AgendamentosAgrupados as CoreAgendamentosAgrupados,
} from '@core/models';
import {
  TipoAgendamento,
  TipoAgendamentoLabels,
  TipoAgendamentoFrase,
} from '@core/models';

export { TipoAgendamento, TipoAgendamentoLabels, TipoAgendamentoFrase };

export type AgendamentosModel = CoreAgendamento;
export type AgendamentosAgrupados = CoreAgendamentosAgrupados;
