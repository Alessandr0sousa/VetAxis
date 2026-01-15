import { BaseEntity } from './base-entity';
import { Cliente } from './cliente';
export interface Pet extends BaseEntity{
  sexo: String;
  esterilizacao: boolean;
  nascimento: string;
  especie: string;
  raca?: string;
  pelagem?: string;
  status: boolean;
  temperamento?: string;
  microchip?: boolean;
  chip?: string;
  cliente: Cliente;
}
