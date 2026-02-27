import { BaseEntity } from "./base-entity";
import { Endereco } from "./endereco-model";

export interface Pessoa extends BaseEntity{
  telefone: string;
  email: string;
  endereco: Endereco;
}
