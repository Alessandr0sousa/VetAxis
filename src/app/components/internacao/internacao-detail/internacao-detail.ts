import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  InternacaoEvolucaoResponseDTO,
  InternacaoResponseDTO,
  StatusInternacao,
} from '@features/internacoes';
import { formatarData, getStatusClass, getStatusLabel } from '../internacao-ui.utils';

@Component({
  selector: 'app-internacao-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './internacao-detail.html',
})
export class InternacaoDetail {
  readonly detailLoading = input.required<boolean>();
  readonly selected = input<InternacaoResponseDTO | null>(null);
  readonly activeTab = input.required<'resumo' | 'evolucao' | 'alta'>();
  readonly selectedIsFinalizado = input.required<boolean>();

  readonly evolucoesLoading = input.required<boolean>();
  readonly evolucoes = input.required<InternacaoEvolucaoResponseDTO[]>();
  readonly evolucoesPage = input.required<number>();
  readonly evolucoesTotalPages = input.required<number>();

  readonly tabChange = output<'resumo' | 'evolucao' | 'alta'>();
  readonly abrirEvolucao = output<void>();
  readonly carregarEvolucoes = output<number>();
  readonly abrirAlta = output<void>();
  readonly abrirStatus = output<void>();
  readonly remover = output<number>();

  onTabChange(tab: 'resumo' | 'evolucao' | 'alta'): void {
    this.tabChange.emit(tab);
  }

  onAbrirEvolucao(): void {
    this.abrirEvolucao.emit();
  }

  onEvolucaoPageChange(page: number): void {
    this.carregarEvolucoes.emit(page);
  }

  onAbrirAlta(): void {
    this.abrirAlta.emit();
  }

  onAbrirStatus(): void {
    this.abrirStatus.emit();
  }

  onRemover(id: number): void {
    this.remover.emit(id);
  }

  getStatusLabel = getStatusLabel;
  getStatusClass = getStatusClass;
  formatarData = formatarData;
}
