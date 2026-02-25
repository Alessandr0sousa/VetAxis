export enum StatusExame {
  AGENDADO = 'AGENDADO',
  REALIZADO = 'REALIZADO',
  CANCELADO = 'CANCELADO',
}

export const StatusExameLabels: { [key in StatusExame]: string } = {
  [StatusExame.AGENDADO]: 'Agendado',
  [StatusExame.REALIZADO]: 'Realizado',
  [StatusExame.CANCELADO]: 'Cancelado',
};

export interface ExameModel {
  exame?: {
    tipo: string;
    descricao: string;
    materialColetado: string;
  };
}
