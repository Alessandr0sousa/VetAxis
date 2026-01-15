import { Pessoa } from "./pessoa";
export interface Cliente extends Pessoa {
  cpf: string;
}
