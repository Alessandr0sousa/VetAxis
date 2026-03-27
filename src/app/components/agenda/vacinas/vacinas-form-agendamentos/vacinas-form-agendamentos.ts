import { Component, Input, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConsultasFormAgendamentosModel } from '../../../models/consultas-form-agendametos-model';
import { AgendamentosService } from '@features/agendamentos';
import { TipoAgendamento } from '../../../models/agendamentos-model';
import { AlertService } from '@shared/services';
import { UserProfileService } from '@infrastructure/storage';

@Component({
  selector: 'app-vacinas-form-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './vacinas-form-agendamentos.html',
  styleUrl: './vacinas-form-agendamentos.scss',
})
export class VacinasFormAgendamentos implements OnInit {
  @Input() tipoAgendamento: TipoAgendamento = TipoAgendamento.VACINA;

  @Output() cancelar = new EventEmitter<void>();
  selectedVeterinario = signal<any | null>(null);
  tipo = signal<string>('');
  nome = signal<string>('');
  lote = signal<string>('');
  fabricante = signal<string>('');
  dataValidade = signal<string>('');
  dose = signal<string>('');
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
    this.diaSelecionado.set(`${ano}-${mes}-${dia}`);
  }

  onSalvar(): void {
    if (!this.selectedHorario() || !this.tipo()) {
      this.alertService.warning('Selecione horário e tipo de vacina');
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
      nomeAgendamento: this.nome() ? `Vacina ${this.nome()}` : 'Vacina',
      veterinario: this.selectedVeterinario(),
      dia: this.diaSelecionado(),
      horario: this.selectedHorario()!,
      pet: {} as any,  // Será preenchido pelo componente pai
      tipoAgendamento: TipoAgendamento.VACINA,
      peso: 0,
      clinicaId: clinicaId,
      // Campos de vacina (flattened)
      tipo: this.tipo(),
      nome: this.nome(),
      lote: this.lote(),
      fabricante: this.fabricante(),
      dataValidade: this.dataValidade(),
      dose: this.dose(),
      statusVacina: 'APLICADA',
    } as ConsultasFormAgendamentosModel;

    this.agendamentosService.salvarVacina(agendamento).subscribe({
      next: () => {
        this.alertService.success('Vacina agendada com sucesso!');
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Erro ao agendar vacina', err);
        this.alertService.error('Erro ao agendar vacina');
      },
    });
  }

  resetForm(): void {
    this.selectedHorario.set(null);
    this.tipo.set('');
    this.nome.set('');
    this.lote.set('');
    this.fabricante.set('');
    this.dataValidade.set('');
    this.dose.set('');
    this.selectedVeterinario.set(null);
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
