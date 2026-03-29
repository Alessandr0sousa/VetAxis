export interface AnexoModel {
  id?: number;
  nome: string;
  tipo: string;
  arquivo: string; // base64
  agendamentoId?: number;
}

export const TIPOS_ANEXOS_PERMITIDOS = [
  'application/pdf',
  'image/png',
  'image/jpg',
  'image/jpeg',
];

export const EXTENSOES_ANEXOS_PERMITIDAS = ['.pdf', '.png', '.jpg', '.jpeg'];

export const TAMANHO_MAXIMO_ANEXO = 10 * 1024 * 1024; // 10MB
