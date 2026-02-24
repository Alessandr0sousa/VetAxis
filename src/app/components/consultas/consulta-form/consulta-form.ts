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
import { AnexosUpload } from '../../shared/anexos-upload/anexos-upload';

@Component({
  selector: 'app-consulta-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AnexosUpload],
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
    this.carregarDados();
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
      anexos: [[]],
    });
  }

  carregarDados() {
    if (this.agendamento) {
      this.form.patchValue({
        id: this.agendamento.id,
        peso: this.agendamento.peso,
        pet: this.agendamento.pet.id,
        veterinarioNome: this.agendamento.veterinario.nome,
        petNome: this.agendamento.pet.nome,
        consultaOrigem: this.agendamento.consultaOrigem,
        // NÃO passar anexos aqui - deixar AnexosUpload gerenciar via API
      });

      if (this.agendamento.consulta) {
        this.form.get('consulta')?.patchValue(this.agendamento.consulta);
      }
    }
  }


  salvarConsulta() {
    this.agendamento!.consulta.anamnese = this.form.get('consulta.anamnese')?.value;
    this.agendamento!.consulta.exameFisico = this.form.get('consulta.exameFisico')?.value;
    this.agendamento!.consulta.tratamento = this.form.get('consulta.tratamento')?.value;
    this.agendamento!.consulta.prescricao = this.form.get('consulta.prescricao')?.value;
    this.agendamento!.consulta.diagnostico = this.form.get('consulta.diagnostico')?.value;
    this.agendamento!.consulta.internamento = this.form.get('consulta.internamento')?.value ?? false;
    this.agendamento!.peso = this.form.get('peso')?.value;

    // Anexos são gerenciados APENAS pelo componente AnexosUpload
    // Nunca modificar anexos aqui

    this.agendamento!.consulta.status = 'REALIZADO' as any;

    delete (this.agendamento as any).veterinarioNome;
    delete (this.agendamento as any).petNome;

    this.consultaConcluida.emit(this.agendamento);
  }
}
