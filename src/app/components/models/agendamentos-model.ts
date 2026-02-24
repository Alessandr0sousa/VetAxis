import { Pet } from './pet';
import { VeterinarioModel } from './veterinario-model';
import { BaseEntity } from "./base-entity";
import { AnexoModel } from './anexo-model';

export interface AgendamentosModel extends BaseEntity {
  veterinario: VeterinarioModel;
  dia: string;
  horario: string;
  pet: Pet;
  isRetorno?: boolean;
  peso: number;
  consultaOrigem: AgendamentosModel | null;
  anexos?: AnexoModel[];
}
