import { Component, Input, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConsultasFormAgendamentosModel } from '../../../models/consultas-form-agendametos-model';
import { AgendamentosService } from '@features/agendamentos';
import { TipoAgendamento } from '../../../models/agendamentos-model';
import { AlertService } from '@shared/services';
import { UserProfileService } from '@infrastructure/storage';

@Component({
  selector: 'app-cirurgias-form-agendamentos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cirurgias-form-agendamentos.html',
  styleUrl: './cirurgias-form-agendamentos.scss',
})
export class CirurgiasFormAgendamentos implements OnInit {
  @Input() tipoAgendamento: TipoAgendamento = TipoAgendamento.CIRURGIA;

  @Output() cancelar = new EventEmitter<void>();
  selectedVeterinario = signal<any | null>(null);
  descricao = signal<string>('');
  tipo = signal<string>('');
  anestesia = signal<string>('');
  anestesista = signal<string>('');
  protocoloAnestesia = signal<string>('');
  relaProcedimento = signal<string>('');
  internamento = signal<boolean>(false);
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
      this.alertService.warning('Selecione horário e tipo de cirurgia');
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
      nome: 'Cirurgia',
      veterinario: this.selectedVeterinario(),
      dia: this.diaSelecionado(),
      horario: this.selectedHorario()!,
      pet: {} as any,  // Será preenchido pelo componente pai
      tipoAgendamento: TipoAgendamento.CIRURGIA,
      peso: 0,
      clinicaId: clinicaId,
      // Campos de cirurgia (flattened)
      tipo: this.tipo(),
      descricao: this.descricao(),
      anestesia: this.anestesia(),
      anestesista: this.anestesista(),
      protocoloAnestesia: this.protocoloAnestesia(),
      relaProcedimento: this.relaProcedimento(),
      internamento: this.internamento(),
      statusCirurgia: 'AGENDADA',
    } as ConsultasFormAgendamentosModel;

    this.agendamentosService.salvarCirurgia(agendamento).subscribe({
      next: () => {
        this.alertService.success('Cirurgia agendada com sucesso!');
        this.resetForm();
      },
      error: (err: any) => {
        console.error('Erro ao agendar cirurgia', err);
        this.alertService.error('Erro ao agendar cirurgia');
      },
    });
  }

  resetForm(): void {
    this.selectedHorario.set(null);
    this.tipo.set('');
    this.descricao.set('');
    this.anestesia.set('');
    this.anestesista.set('');
    this.protocoloAnestesia.set('');
    this.relaProcedimento.set('');
    this.internamento.set(false);
    this.selectedVeterinario.set(null);
  }

  onCancelar(): void {
    this.cancelar.emit();
  }
}
