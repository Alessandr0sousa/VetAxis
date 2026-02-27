import { BaseEntity } from './base-entity';
import { Endereco } from './endereco-model';

export interface ClinicaModel extends BaseEntity {
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: Endereco;
  logo?: string;
}
