import { Pet } from "./pet";

export interface ConsultaModel {
  id: number;
  agendamento: Date;
  peso: number;
  anamnese: string;
  exameFisico: string;
  tratamento: string;
  prescricao: string;
  diagnostico: string;
  internamento: boolean;
  pet: Pet;
}
