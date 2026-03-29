import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { InternacaoResponseDTO } from '@features/internacoes';
import { formatarData, getStatusClass, getStatusLabel } from '../internacao-ui.utils';

@Component({
  selector: 'app-internacao-patient-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './internacao-patient-list.html',
})
export class InternacaoPatientList {
  readonly listLoading = input.required<boolean>();
  readonly internacoes = input.required<InternacaoResponseDTO[]>();
  readonly selectedId = input<number | null>(null);

  readonly selecionar = output<number>();

  onSelecionar(id: number): void {
    this.selecionar.emit(id);
  }

  getStatusLabel = getStatusLabel;
  getStatusClass = getStatusClass;
  formatarData = formatarData;
}
