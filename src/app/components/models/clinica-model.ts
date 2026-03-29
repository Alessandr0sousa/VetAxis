import { BaseEntity } from './base-entity';
import { Endereco } from './endereco-model';

export interface ClinicaModel extends BaseEntity {
  // Hereda: id e nome do BaseEntity
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: Endereco;
  logo?: string;
}
