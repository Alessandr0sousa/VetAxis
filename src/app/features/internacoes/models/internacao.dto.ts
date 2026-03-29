import { Page } from '../../../components/models/page';

export type OrigemTipo = 'CONSULTA' | 'CIRURGIA' | 'OUTRO';

export type StatusInternacao =
  | 'PRE_INTERNACAO'
  | 'ADMITIDO'
  | 'EM_OBSERVACAO'
  | 'EM_TRATAMENTO'
  | 'POS_CIRURGICO'
  | 'AGUARDANDO_ALTA'
  | 'ALTA_CONCLUIDA'
  | 'OBITO';

export interface InternacaoRequestDTO {
  nome?: string;
  petId: number;
  veterinarioId: number;
  origemTipo: OrigemTipo;
  origemId?: number | null;
  dataHoraAdmissao: string;
  motivoInternacao: string;
  internamento: true;
  pesoEntrada?: number | null;
  pesoAtual?: number | null;
}

export interface InternacaoResponseDTO {
  id: number;
  nome: string;
  clinicaId: number;
  petId: number;
  petNome: string;
  veterinarioId: number;
  veterinarioNome: string;
  origemTipo: OrigemTipo;
  origemId?: number | null;
  dataHoraAdmissao: string;
  motivoInternacao: string;
  statusInternacao: StatusInternacao;
  internamento: boolean;
  pesoEntrada?: number | null;
  pesoAtual?: number | null;
  dataHoraAlta?: string | null;
  resumoAlta?: string | null;
  orientacoesAlta?: string | null;
}

export interface InternacaoStatusRequestDTO {
  novoStatus: StatusInternacao;
  justificativa?: string;
}

export interface InternacaoAltaRequestDTO {
  dataHoraAlta: string;
  condicaoAlta: string;
  resumoAlta: string;
  orientacoesTutor: string;
  retornoRecomendado: boolean;
  dataRetorno?: string | null;
}

export interface InternacaoEvolucaoRequestDTO {
  veterinarioId: number;
  dataHora: string;
  descricao: string;
  conduta?: string;
  proximaReavaliacao?: string;
}

export interface InternacaoEvolucaoResponseDTO {
  id: number;
  internacaoId: number;
  veterinarioId: number;
  veterinarioNome: string;
  dataHora: string;
  descricao: string;
  conduta?: string | null;
  proximaReavaliacao?: string | null;
  createdAt: string;
}

export type InternacaoPageResponse = Page<InternacaoResponseDTO> & {
  pageable?: {
    pageNumber: number;
    pageSize: number;
  };
};

export type InternacaoEvolucaoPageResponse = Page<InternacaoEvolucaoResponseDTO> & {
  pageable?: {
    pageNumber: number;
    pageSize: number;
  };
};
