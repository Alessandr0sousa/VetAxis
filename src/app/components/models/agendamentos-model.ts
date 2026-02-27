import { Pet } from './pet';
import { VeterinarioModel } from './veterinario-model';
import { BaseEntity } from "./base-entity";
import { AnexoModel } from './anexo-model';
import { ClinicaModel } from './clinica-model';

export enum TipoAgendamento {
  CONSULTA = 'CONSULTA',
  CIRURGIA = 'CIRURGIA',
  EXAME = 'EXAME',
  VACINA = 'VACINA',
}

export const TipoAgendamentoLabels: { [key in TipoAgendamento]: string } = {
  [TipoAgendamento.CONSULTA]: 'Consulta',
  [TipoAgendamento.CIRURGIA]: 'Cirurgia',
  [TipoAgendamento.EXAME]: 'Exame',
  [TipoAgendamento.VACINA]: 'Vacina',
};

export const TipoAgendamentoFrase: { [key in TipoAgendamento]: string } = {
  [TipoAgendamento.CONSULTA]: 'Consulta agendada para',
  [TipoAgendamento.CIRURGIA]: 'Cirurgia agendada para',
  [TipoAgendamento.EXAME]: 'Exame agendado para',
  [TipoAgendamento.VACINA]: 'Vacina agendada para',
};

export interface AgendamentosModel extends BaseEntity {
  veterinario: VeterinarioModel;
  clinica?: ClinicaModel;
  dia: string;
  horario: string;
  pet: Pet;
  tipoAgendamento?: TipoAgendamento;
  isRetorno?: boolean;
  peso: number;
  consultaOrigem: AgendamentosModel | null;
  anexos?: AnexoModel[];
}
