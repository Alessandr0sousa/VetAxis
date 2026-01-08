import { BaseEntity } from "./base-entity";

export interface Pessoa extends BaseEntity{
  cpf: string;
  telefone: string;
  email: string;
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
}
