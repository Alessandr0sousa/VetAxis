import { AgendamentoCompleto } from '../../../core/models';

/**
 * DTO para criar agendamento (sem ID)
 */
export interface CreateAgendamentoDTO {
  nome: string;
  veterinarioId: number;
  petId: number;
  clinicaId: number;
  dia: string;
  horario: string;
  peso: number;
  tipoAgendamento: string;
  isRetorno?: boolean;
  consultaOrigemId?: number;
  
  // Campos específicos dependendo do tipo
  anamnese?: string;
  exameFisico?: string;
  diagnostico?: string;
  tratamento?: string;
  prescricao?: string;
  internamento?: boolean;
  tipo?: string;
  descricao?: string;
  lote?: string;
  fabricante?: string;
}

/**
 * DTO para atualizar agendamento (com ID)
 */
export interface UpdateAgendamentoDTO extends Partial<CreateAgendamentoDTO> {
  id: number;
  status?: string;
}

/**
 * DTO para resposta de agendamento do backend
 */
export type AgendamentoResponseDTO = AgendamentoCompleto;

/**
 * DTO para filtros de busca de agendamentos
 */
export interface AgendamentoFiltersDTO {
  dia?: string;
  veterinarioId?: number;
  petId?: number;
  status?: string;
  tipoAgendamento?: string;
}
