import { InternacaoResponseDTO, StatusInternacao } from '@features/internacoes';

export const STATUS_LABELS: Record<StatusInternacao, string> = {
  PRE_INTERNACAO: 'Pré-internação',
  ADMITIDO: 'Admitido',
  EM_OBSERVACAO: 'Em observação',
  EM_TRATAMENTO: 'Em tratamento',
  POS_CIRURGICO: 'Pós-cirúrgico',
  AGUARDANDO_ALTA: 'Aguardando alta',
  ALTA_CONCLUIDA: 'Alta concluída',
  OBITO: 'Óbito',
};

export const STATUS_CLASSES: Record<StatusInternacao, string> = {
  PRE_INTERNACAO: 'status-badge status-pre',
  ADMITIDO: 'status-badge status-admitido',
  EM_OBSERVACAO: 'status-badge status-observacao',
  EM_TRATAMENTO: 'status-badge status-tratamento',
  POS_CIRURGICO: 'status-badge status-pos-cirurgico',
  AGUARDANDO_ALTA: 'status-badge status-aguardando',
  ALTA_CONCLUIDA: 'status-badge status-alta',
  OBITO: 'status-badge status-obito',
};

export function getStatusLabel(status: StatusInternacao): string {
  return STATUS_LABELS[status];
}

export function getStatusClass(status: StatusInternacao): string {
  return STATUS_CLASSES[status];
}

export function formatarData(date: string | null | undefined): string {
  if (!date) return '-';
  return new Date(date).toLocaleString('pt-BR');
}

export function filtrarInternacoes(
  internacoes: InternacaoResponseDTO[],
  textoBusca: string,
  filtroStatus: StatusInternacao | '',
): InternacaoResponseDTO[] {
  const texto = textoBusca.trim().toLowerCase();

  return internacoes.filter((item) => {
    const matchStatus = !filtroStatus || item.statusInternacao === filtroStatus;
    const matchBusca =
      !texto ||
      item.nome?.toLowerCase().includes(texto) ||
      item.petNome?.toLowerCase().includes(texto) ||
      item.veterinarioNome?.toLowerCase().includes(texto);

    return matchStatus && matchBusca;
  });
}
