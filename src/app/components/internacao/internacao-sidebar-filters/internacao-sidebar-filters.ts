import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { StatusInternacao } from '@features/internacoes';
import { getStatusLabel } from '../internacao-ui.utils';

@Component({
  selector: 'app-internacao-sidebar-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './internacao-sidebar-filters.html',
})
export class InternacaoSidebarFilters {
  readonly busca = input.required<string>();
  readonly filtroStatus = input.required<StatusInternacao | ''>();
  readonly statusOptions = input.required<StatusInternacao[]>();
  readonly listLoading = input.required<boolean>();
  readonly totalResultados = input.required<number>();
  readonly listPage = input.required<number>();
  readonly listTotalPages = input.required<number>();

  readonly buscaChange = output<string>();
  readonly filtroStatusChange = output<string>();
  readonly pageChange = output<number>();

  onBuscaInput(value: string): void {
    this.buscaChange.emit(value);
  }

  onStatusChange(value: string): void {
    this.filtroStatusChange.emit(value);
  }

  pageAnterior(): void {
    this.pageChange.emit(this.listPage() - 1);
  }

  pageProxima(): void {
    this.pageChange.emit(this.listPage() + 1);
  }

  getStatusLabel(status: StatusInternacao): string {
    return getStatusLabel(status);
  }
}
