import { Injectable, computed, signal } from '@angular/core';
import { InternacaoEvolucaoResponseDTO, InternacaoResponseDTO, StatusInternacao } from '@features/internacoes';
import { filtrarInternacoes } from './internacao-ui.utils';

@Injectable()
export class InternacaoFacade {
  readonly listLoading = signal(false);
  readonly detailLoading = signal(false);
  readonly evolucoesLoading = signal(false);

  readonly internacoes = signal<InternacaoResponseDTO[]>([]);
  readonly evolucoes = signal<InternacaoEvolucaoResponseDTO[]>([]);
  readonly selected = signal<InternacaoResponseDTO | null>(null);

  readonly listPage = signal(0);
  readonly listTotalPages = signal(1);
  readonly evolucoesPage = signal(0);
  readonly evolucoesTotalPages = signal(1);

  readonly filtroStatus = signal<StatusInternacao | ''>('');
  readonly busca = signal('');
  readonly activeTab = signal<'resumo' | 'evolucao' | 'alta'>('resumo');

  readonly modalNovaInternacao = signal(false);
  readonly modalNovaEvolucao = signal(false);
  readonly modalAlterarStatus = signal(false);
  readonly modalAlta = signal(false);

  readonly transicoes: Record<StatusInternacao, StatusInternacao[]> = {
    PRE_INTERNACAO: ['ADMITIDO', 'OBITO'],
    ADMITIDO: ['EM_OBSERVACAO', 'EM_TRATAMENTO', 'POS_CIRURGICO', 'AGUARDANDO_ALTA', 'OBITO'],
    EM_OBSERVACAO: ['EM_TRATAMENTO', 'AGUARDANDO_ALTA', 'OBITO'],
    EM_TRATAMENTO: ['AGUARDANDO_ALTA', 'OBITO'],
    POS_CIRURGICO: ['EM_TRATAMENTO', 'AGUARDANDO_ALTA', 'OBITO'],
    AGUARDANDO_ALTA: ['ALTA_CONCLUIDA', 'OBITO'],
    ALTA_CONCLUIDA: [],
    OBITO: [],
  };

  readonly internacoesFiltradas = computed(() => {
    return filtrarInternacoes(this.internacoes(), this.busca(), this.filtroStatus());
  });

  readonly statusPermitidos = computed(() => {
    const atual = this.selected()?.statusInternacao;
    if (!atual) return [];
    return this.transicoes[atual] ?? [];
  });

  readonly selectedIsFinalizado = computed(() => {
    const status = this.selected()?.statusInternacao;
    return status === 'ALTA_CONCLUIDA' || status === 'OBITO';
  });
}
