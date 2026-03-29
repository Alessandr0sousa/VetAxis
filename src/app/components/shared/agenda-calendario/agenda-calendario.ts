import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-agenda-calendario',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DatePicker],
  templateUrl: './agenda-calendario.html',
  styleUrls: ['./agenda-calendario.scss'],
})
export class AgendaCalendario implements OnChanges {
  @Output() diaSelecionado = new EventEmitter<string>();
  @Input() diasHabilitados: Date[] = [];

  now: Date = new Date();
  date: Date = this.now;
  diasIndisponiveis: Date[] = [];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['diasHabilitados'] && changes['diasHabilitados'].currentValue) {
      this.atualizarDiasIndisponiveis();
      // Força detecção de mudanças para atualizar o calendário
      this.cdr.markForCheck();
    }
  }

  private atualizarDiasIndisponiveis(): void {
    if (this.diasHabilitados.length === 0) {
      this.diasIndisponiveis = [];
      return;
    }

    // Normaliza e cria set de timestamps uma única vez
    const datasHabilitadasSet = new Set<number>();
    for (const d of this.diasHabilitados) {
      const normalized = new Date(d);
      normalized.setHours(0, 0, 0, 0);
      datasHabilitadasSet.add(normalized.getTime());
    }

    // Encontra o intervalo de datas (primeira e última data habilitada)
    const timestamps = Array.from(datasHabilitadasSet).sort((a, b) => a - b);
    const primeiraData = new Date(timestamps[0]);
    const ultimaData = new Date(timestamps[timestamps.length - 1]);

    // Buffer de 7 dias antes e 60 dias depois
    const dataInicio = new Date(primeiraData);
    dataInicio.setDate(dataInicio.getDate() - 7);

    const dataFim = new Date(ultimaData);
    dataFim.setDate(dataFim.getDate() + 180);

    // Gera datas indisponíveis de forma otimizada
    const diasIndisponiveis: Date[] = [];
    const umDiaMs = 86400000; // 24 * 60 * 60 * 1000

    // Inicia no primeiro midnight do período
    let timestamp = dataInicio.getTime();
    dataInicio.setHours(0, 0, 0, 0);
    timestamp = dataInicio.getTime();

    const dataFimTimestamp = dataFim.getTime();

    while (timestamp <= dataFimTimestamp) {
      if (!datasHabilitadasSet.has(timestamp)) {
        diasIndisponiveis.push(new Date(timestamp));
      }
      timestamp += umDiaMs;
    }

    // Cria nova referência para garantir detecção de mudanças
    this.diasIndisponiveis = diasIndisponiveis;
  }

  selecionarDia(): void {
    if (this.date) {
      const diaFormatado = this.formatarData(this.date);
      this.diaSelecionado.emit(diaFormatado);
    }
  }

  private formatarData(date: Date): string {
    return date.toLocaleDateString('pt-BR'); // dd/MM/yyyy
  }
}
