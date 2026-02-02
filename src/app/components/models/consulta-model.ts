export interface ConsultaModel {
  consulta: {
    anamnese: string;
    exameFisico: string;
    tratamento: string;
    prescricao: string;
    diagnostico: string;
    internamento: boolean;
    status: StatusAgendamento;
  };
}

export enum StatusAgendamento {
  AGENDADO = 'AGENDADO',
  CONFIRMADO = 'CONFIRMADO',
  CANCELADO = 'CANCELADO',
  INICIADO = 'INICIADO',
  REALIZADO = 'REALIZADO',
}

export const StatusAgendamentoLabels: { [key in StatusAgendamento]: string } = {
  [StatusAgendamento.AGENDADO]: 'Agendado',
  [StatusAgendamento.CONFIRMADO]: 'Confirmado',
  [StatusAgendamento.CANCELADO]: 'Cancelado',
  [StatusAgendamento.INICIADO]: 'Iniciado',
  [StatusAgendamento.REALIZADO]: 'Realizado',
};

export const STATUS_BADGE_CLASS: Record<StatusAgendamento, string> = {
  [StatusAgendamento.AGENDADO]: 'text-white bg-secondary',
  [StatusAgendamento.CONFIRMADO]: 'text-white bg-primary',
  [StatusAgendamento.CANCELADO]: 'text-white bg-danger',
  [StatusAgendamento.INICIADO]: 'text-white bg-warning',
  [StatusAgendamento.REALIZADO]: 'text-white bg-success',
};

export const STATUS_ICON_CLASS: Record<StatusAgendamento, string> = {
  [StatusAgendamento.AGENDADO]: 'fa-solid fa-calendar-plus',   // calendário com "+"
  [StatusAgendamento.CONFIRMADO]: 'fa-solid fa-check-circle',  // círculo com check
  [StatusAgendamento.CANCELADO]: 'fa-solid fa-times-circle',   // círculo com "X"
  [StatusAgendamento.INICIADO]: 'fa-solid fa-play-circle',     // círculo com "play"
  [StatusAgendamento.REALIZADO]: 'fa-solid fa-check-double',   // check duplo
};

export const STATUS_FONT_CLASS: Record<StatusAgendamento, string> = {
  [StatusAgendamento.AGENDADO]: 'text-secondary',   // cinza
  [StatusAgendamento.CONFIRMADO]: 'text-primary',   // azul
  [StatusAgendamento.CANCELADO]: 'text-danger',     // vermelho
  [StatusAgendamento.INICIADO]: 'text-warning',     // amarelo
  [StatusAgendamento.REALIZADO]: 'text-success',    // verde
};

