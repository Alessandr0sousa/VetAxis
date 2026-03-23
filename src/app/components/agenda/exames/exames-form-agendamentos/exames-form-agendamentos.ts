import { Component, Input, OnInit, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConsultasFormAgendamentosModel } from '../../../models/consultas-form-agendametos-model';
import { AgendamentosService } from '@features/agendamentos';
import { TipoAgendamento } from '../../../models/agendamentos-model';
import { AlertService } from '@shared/services';
import { UserProfileService } from '@infrastructure/storage';

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
    private agendamentosService: AgendamentosService,
    private alertService: AlertService,
    private userProfileService: UserProfileService
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
      this.alertService.warning('Selecione horário e tipo de exame');
      return;
    }

    // Obtém clinicaId atualizado
    const clinicaId = this.userProfileService.getClinicaId();

    // Validação essencial: clinicaId deve ser válido
    if (!this.userProfileService.isProfileValid() || clinicaId <= 0) {
      this.alertService.error('Perfil de usuário inválido. Por favor, faça login novamente.');
      console.error('Perfil inválido ou clinicaId <= 0:', { clinicaId });
      return;
    }

    const agendamento: ConsultasFormAgendamentosModel = {
      id: 0,
      nome: 'Exame',
      veterinario: this.selectedVeterinario(),
      dia: this.diaSelecionado(),
      horario: this.selectedHorario()!,
      pet: {} as any,  // Será preenchido pelo componente pai
      tipoAgendamento: TipoAgendamento.EXAME,
      peso: 0,
      clinicaId: clinicaId,
      // Campos de exame (flattened)
      tipo: this.tipo(),
      descricao: this.descricaoExame(),
      materialColetado: '',
      achados: '',
      laudo: '',
      statusExame: 'AGENDADO',
    } as ConsultasFormAgendamentosModel;

    this.agendamentosService.salvarExame(agendamento).subscribe({
      next: () => {
        this.alertService.success('Exame agendado com sucesso!');
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Erro ao agendar exame', err);
        this.alertService.error('Erro ao agendar exame');
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
