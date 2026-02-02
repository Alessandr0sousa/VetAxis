import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ConsultaModel,
  StatusAgendamento,
  StatusAgendamentoLabels,
} from '../../models/consulta-model';
import { ConsultasFormAgendamentosModel } from '../../models/consultas-form-agendametos-model';
import { Customservice } from '../../services/customservice';
import { ViaCepService } from '../../services/viacepservice';
import { BaseForm } from '../../shared/base-form/base-form';
import { Pet } from './../../models/pet';

@Component({
  selector: 'app-consulta-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consulta-form.html',
  styleUrls: ['./consulta-form.scss'],
})
export class ConsultaForm extends BaseForm<ConsultaModel> {
  @Input() agendamento?: ConsultasFormAgendamentosModel;
  @Output() consultaConcluida = new EventEmitter<ConsultasFormAgendamentosModel>();

  statusOptions = Object.values(StatusAgendamento).map((status) => ({
    value: status,
    label: StatusAgendamentoLabels[status],
  }));

  pets: Pet[] = [];

  constructor(
    fb: FormBuilder,
    viaCep: ViaCepService,
    customService: Customservice,
    cdr: ChangeDetectorRef,
    location: Location,
  ) {
    super(fb, viaCep, customService, cdr, location);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  protected buildForm(): void {
    this.form = this.fb.group({
      id: [null],
      peso: [null, [Validators.required, Validators.min(0)]],
      pet: [null, Validators.required],
      consultaOrigem: [null],
      veterinarioNome: [null],
      petNome: [null],
      consulta: this.fb.group({
        anamnese: ['', Validators.required],
        exameFisico: ['', Validators.required],
        tratamento: ['', Validators.required],
        prescricao: ['', Validators.required],
        diagnostico: ['', Validators.required],
        internamento: [false],
        status: [null],
      }),
    });
  }

  salvarConsulta() {
    this.agendamento = this.agendamento || ({} as ConsultasFormAgendamentosModel);
    this.agendamento.consulta.status = 'REALIZADO' as any;
    this.consultaConcluida.emit(this.agendamento);
  }
}
