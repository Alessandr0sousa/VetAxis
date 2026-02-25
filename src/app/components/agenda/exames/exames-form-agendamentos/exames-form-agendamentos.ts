import { Component, Input, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConsultasFormAgendamentosModel } from '../../../models/consultas-form-agendametos-model';
import { AgendamentosService } from '../../../services/agendamentos-service';
import { TipoAgendamento } from '../../../models/agendamentos-model';

@Component({
  selector: 'app-exames-form-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './exames-form-agendamentos.html',
  styleUrl: './exames-form-agendamentos.scss',
})
export class ExamesFormAgendamentos implements OnInit {
  @Input() tipoAgendamento: TipoAgendamento = TipoAgendamento.EXAME;

  selectedVeterinario = signal<any | null>(null);
  descricaoExame = signal<string>('');
  tipo = signal<string>('');
  selectedHorario = signal<string | null>(null);
  diaSelecionado = signal<string>('');

  horariosDisponiveis = signal<string[]>([
    '08:00', '09:00', '10:00', '11:00',
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ]);

  constructor(
    private agendamentosService: AgendamentosService
  ) {}

  ngOnInit(): void {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    this.diaSelecionado.set(`${dia}/${mes}/${ano}`);
  }

  onSalvar(): void {
    if (!this.selectedHorario() || !this.tipo()) {
      alert('Selecione horário e tipo de exame');
      return;
    }

    const agendamento: any = {
      veterinario: this.selectedVeterinario(),
      dia: this.diaSelecionado(),
      horario: this.selectedHorario()!,
      tipo: this.tipoAgendamento,
      peso: 0,
      exame: {
        tipo: this.tipo(),
        descricao: this.descricaoExame(),
        materialColetado: '',
        achados: '',
        laudo: '',
        statusExame: 'AGENDADO',
      }
    };

    this.agendamentosService.salvar(agendamento).subscribe({
      next: () => {
        alert('Exame agendado com sucesso!');
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Erro ao agendar exame', err);
        alert('Erro ao agendar exame');
      },
    });
  }

  resetForm(): void {
    this.selectedHorario.set(null);
    this.tipo.set('');
    this.descricaoExame.set('');
    this.selectedVeterinario.set(null);
  }
}
