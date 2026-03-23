/**
 * Enumeração de tipos de agendamento
 */
export enum TipoAgendamento {
  CONSULTA = 'CONSULTA',
  CIRURGIA = 'CIRURGIA',
  EXAME = 'EXAME',
  VACINA = 'VACINA',
}

/**
 * Labels legíveis para tipos de agendamento
 */
export const TipoAgendamentoLabels: Record<TipoAgendamento, string> = {
  [TipoAgendamento.CONSULTA]: 'Consulta',
  [TipoAgendamento.CIRURGIA]: 'Cirurgia',
  [TipoAgendamento.EXAME]: 'Exame',
  [TipoAgendamento.VACINA]: 'Vacina',
};

/**
 * Frases descritivas para tipos de agendamento
 */
export const TipoAgendamentoFrase: Record<TipoAgendamento, string> = {
  [TipoAgendamento.CONSULTA]: 'Consulta agendada para',
  [TipoAgendamento.CIRURGIA]: 'Cirurgia agendada para',
  [TipoAgendamento.EXAME]: 'Exame agendado para',
  [TipoAgendamento.VACINA]: 'Vacina agendada para',
};

/**
 * Enumeração de status de agendamento
 */
export enum StatusAgendamento {
  AGENDADO = 'AGENDADO',
  CONFIRMADO = 'CONFIRMADO',
  CANCELADO = 'CANCELADO',
  INICIADO = 'INICIADO',
  REALIZADO = 'REALIZADO',
}

/**
 * Classes CSS para badges de status
 */
export const STATUS_BADGE_CLASS: Record<StatusAgendamento, string> = {
  [StatusAgendamento.AGENDADO]: 'badge bg-warning text-dark',
  [StatusAgendamento.CONFIRMADO]: 'badge bg-success',
  [StatusAgendamento.CANCELADO]: 'badge bg-danger',
  [StatusAgendamento.INICIADO]: 'badge bg-info',
  [StatusAgendamento.REALIZADO]: 'badge bg-primary',
};

/**
 * Enumeração de status de exame
 */
export enum StatusExame {
  AGENDADO = 'AGENDADO',
  REALIZADO = 'REALIZADO',
  CANCELADO = 'CANCELADO',
}

/**
 * Labels para status de exame
 */
export const StatusExameLabels: Record<StatusExame, string> = {
  [StatusExame.AGENDADO]: 'Agendado',
  [StatusExame.REALIZADO]: 'Realizado',
  [StatusExame.CANCELADO]: 'Cancelado',
};
