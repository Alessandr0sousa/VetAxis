import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-agenda-calendario',
  imports: [CommonModule, FormsModule, DatePicker],
  templateUrl: './agenda-calendario.html',
  styleUrls: ['./agenda-calendario.scss'],
})
export class AgendaCalendario {
  @Output() diaSelecionado = new EventEmitter<string>();

  now: Date = new Date();
  date: Date = this.now;
  diasIndisponiveis: Date[] = [];

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
