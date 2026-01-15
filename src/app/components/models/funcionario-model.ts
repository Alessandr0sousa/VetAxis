import { Pessoa } from "./pessoa";

export interface FuncionarioModel extends Pessoa{
  cpf: string;
  cargo: string;
  status: boolean;
}
