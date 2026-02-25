import { Pet } from './pet';
import { VeterinarioModel } from './veterinario-model';
import { BaseEntity } from "./base-entity";
import { AnexoModel } from './anexo-model';

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

export interface AgendamentosModel extends BaseEntity {
  veterinario: VeterinarioModel;
  dia: string;
  horario: string;
  pet: Pet;
  isRetorno?: boolean;
  peso: number;
  tipo?: TipoAgendamento;
  consultaOrigem: AgendamentosModel | null;
  anexos?: AnexoModel[];
}
