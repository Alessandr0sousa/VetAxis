import { BaseEntity } from './base.entity';
import { TipoAgendamento } from './enums';

/**
 * Interface simplificada para Veterinário
 */
export interface Veterinario extends BaseEntity {
  crmv?: string;
  especialidade?: string;
}

/**
 * Interface simplificada para Pet
 */
export interface Pet extends BaseEntity {
  sexo?: string;
  status?: boolean;
  esterilizacao?: boolean;
  especie?: string;
  raca?: string;
  pelagem?: string;
  temperamento?: string;
  microchip?: boolean;
  chip?: string;
  dataNascimento?: string;
  clienteId?: number;
  cliente?: {
    id?: number;
    nome?: string;
    cpf?: string;
    endereco?: {
      logradouro?: string;
      bairro?: string;
      numero?: string | number;
      cidade?: string;
      uf?: string;
    };
  };
}

/**
 * Interface simplificada para Clínica
 */
export interface Clinica extends BaseEntity {
  endereco?: string;
  telefone?: string;
}

/**
 * Interface para Anexo
 */
export interface Anexo {
  id: number;
  nome: string;
  tipo: string;
  url: string;
  tamanho?: number;
}

/**
 * Interface base para Agendamento
 */
export interface Agendamento extends BaseEntity {
  veterinario: Veterinario;
  clinica?: Clinica;
  clinicaId: number;
  dia: string;
  horario: string;
  pet: Pet;
  tipoAgendamento?: TipoAgendamento;
  isRetorno?: boolean;
  peso: number;
  consultaOrigem?: Agendamento | null;
  anexos?: Anexo[];
  status?: string;
}

/**
 * Interface para dados específicos de Consulta
 */
export interface ConsultaData {
  id?: number;
  anamnese?: string;
  exameFisico?: string;
  tratamento?: string;
  prescricao?: string;
  diagnostico?: string;
  internamento?: boolean;
  status?: string;
  anexos?: Anexo[];
}

/**
 * Interface para dados específicos de Cirurgia
 */
export interface CirurgiaData {
  id?: number;
  tipo?: string;
  descricao?: string;
  anestesia?: string;
  protocoloAnestesia?: string;
  relaProcedimento?: string;
  internamento?: boolean;
  statusCirurgia?: string;
}

/**
 * Interface para dados específicos de Exame
 */
export interface ExameData {
  id?: number;
  tipo?: string;
  descricao?: string;
  materialColetado?: string;
  achados?: string;
  laudo?: string;
  statusExame?: string;
}

/**
 * Interface para dados específicos de Vacina
 */
export interface VacinaData {
  id?: number;
  tipo?: string;
  nome?: string;
  lote?: string;
  fabricante?: string;
  dataValidade?: string;
  dose?: string;
  statusVacina?: string;
}

/**
 * Interface unificada para agendamentos (todos os tipos)
 */
export interface AgendamentoCompleto
  extends Agendamento,
    Omit<ConsultaData, 'status' | 'id'>,
    Omit<CirurgiaData, 'id'>,
    Omit<ExameData, 'id'>,
    Omit<VacinaData, 'nome' | 'id'> {
  status?: string;
}

/**
 * Interface para agendamentos agrupados por tipo
 */
export interface AgendamentosAgrupados {
  consultas: Agendamento[];
  cirurgias: Agendamento[];
  exames: Agendamento[];
  vacinas: Agendamento[];
  totalConsultas: number;
  totalCirurgias: number;
  totalExames: number;
  totalVacinas: number;
  total: number;
}
