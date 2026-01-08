import { Cliente } from './cliente';
export interface Pet {
  id?: number;
  nome: string;
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
