import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StatusAgendamento } from '../../models/consulta-model';
import { ConsultasFormAgendamentosModel } from '../../models/consultas-form-agendametos-model';
import { Pet } from '../../models/pet';
import { AgendamentosService } from '../../services/agendamentos-service';
import { PetService } from '../../services/pet-service';
import { AgendaCalendario } from '../../shared/agenda-calendario/agenda-calendario';
import { VeterinarioModel } from './../../models/veterinario-model';
import { VeterinarioService } from './../../services/veterinario-service';
import { ConsultasList } from '../consultas-list/consultas-list';
import { AlertService } from '../../services/alert-service';

@Component({
  selector: 'app-consultas-form-agendamentos',
  standalone: true,
  imports: [AgendaCalendario, CommonModule, ReactiveFormsModule, ConsultasList],
  templateUrl: './consultas-form-agendamentos.html',
  styleUrls: ['./consultas-form-agendamentos.scss'],
})
export class ConsultasFormAgendamentos implements OnInit {
  @Input() dto?: ConsultasFormAgendamentosModel;
  @Output() cancelar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<ConsultasFormAgendamentosModel>();

  pets: Pet[] = [];
  vets: VeterinarioModel[] = [];
  form!: FormGroup;
  horas = ['08:00', '09:00', '10:00', '11:00'];
  diaSelected: string = '';

  constructor(
    private fb: FormBuilder,
    private vetService: VeterinarioService,
    private petService: PetService,
    private agendamentoService: AgendamentosService,
    private swa: AlertService,
  ) {}

  ngOnInit(): void {
    this.form = this.criarForm();
    this.listarPets();
    this.diaSelected = new Date().toLocaleDateString('pt-BR');

    if (this.dto) {
      this.listarVeterinarios();
      this.carregarDados();
    }

    this.form.valueChanges.subscribe((val) => {
      const nomeComposto = this.montarNomeAgendamento(val);
      this.form.get('nome')?.setValue(nomeComposto, { emitEvent: false });
    });
  }

  private criarForm(): FormGroup {
    return this.fb.group({
      nome: [''],
      veterinario: [null],
      veterinarioNome: ['', Validators.required],
      dia: ['', Validators.required],
      horario: ['', Validators.required],
      horarios: this.fb.array([]), // ✅ corrigido
      pet: [null],
      petNome: ['', Validators.required],
      isRetorno: [false],
      peso: [0, [Validators.required, Validators.min(0)]],
      consultaOrigem: [null],
      consulta: this.fb.group({
        anamnese: ['', [Validators.required, Validators.minLength(10)]],
        status: [StatusAgendamento.AGENDADO],
      }),
    });
  }

  montarNomeAgendamento(val: any) {
    const petnome = val.petNome || '';
    const dia = val.dia || '';
    const hora = val.horario || '';
    return [petnome, dia, hora].filter(Boolean).join('-');
  }

  get horarios(): FormArray {
    return this.form.get('horarios') as FormArray;
  }

  atualizarDiaSelecionado(dia: string): string {
    this.diaSelected = dia;
    return this.diaSelected;
  }

  toggleHorario(horario: string, event: any) {
    if (event.target.checked) {
      this.horarios.push(this.fb.control(horario));
    } else {
      const index = this.horarios.controls.findIndex((x) => x.value === horario);
      if (index >= 0) this.horarios.removeAt(index);
    }
  }

  listarVeterinarios() {
    this.vetService.listar(0, 10).subscribe({
      next: (data) => (this.vets = data.content ?? []),
      error: (err) => this.swa.error('Erro ao carregar Veterinários'),
    });
  }

  listarPets() {
    this.petService.listar(0, 10).subscribe({
      next: (data) => (this.pets = data.content ?? []),
      error: (err) => this.swa.error('Erro ao carregar Pets'),
    });
  }

  onChangeSelecionado(event: Event, tipo: 'vet' | 'pet') {
    const input = event.target as HTMLInputElement;
    const nomeSelecionado = input.value;

    if (tipo === 'vet') {
      const vetSelecionado = this.vets.find((vet) => vet.nome === nomeSelecionado);
      this.form.get('veterinario')?.setValue(vetSelecionado ?? null);
    }

    if (tipo === 'pet') {
      const petSelecionado = this.pets.find((pet) => pet.nome === nomeSelecionado);
      this.form.get('pet')?.setValue(petSelecionado ?? null);
    }
  }

  salvarAgendamento() {
    if (this.form.valid) {
      const formValue = this.form.value;
      let agendaDto: ConsultasFormAgendamentosModel = {
        ...(this.dto ?? {}),
        ...formValue,
        veterinario: formValue.veterinario,
        pet: formValue.pet,
        isRetorno: formValue.isRetorno ?? false,
      };

      agendaDto = this.limparCampos(agendaDto);

      this.agendamentoService.salvar(agendaDto).subscribe({
        next: () => {
          this.swa.success('Agendamento salvo com sucesso!');
          this.cancelarAgendamento();
        },
        error: () => this.swa.error('Erro ao salvar agendamento'),
      });
    } else {
      this.swa.warning('Preencha todos os campos obrigatórios antes de salvar.');
    }
  }

  carregarDados() {
    if (!this.dto) return;

    this.form.patchValue({
      veterinarioNome: this.dto?.veterinario?.nome ?? '',
      petNome: this.dto?.pet?.nome ?? '',
      pet: this.dto?.pet ?? null,
      veterinario: this.dto?.veterinario ?? null,
      peso: this.dto?.peso ?? 0,
      consultaOrigem: this.dto,
      isRetorno: this.dto?.isRetorno ?? false,
      consulta: {
        anamnese: this.dto?.consulta?.anamnese ?? '',
        status: StatusAgendamento.AGENDADO,
      },
    });
  }

  cancelarAgendamento() {
    this.form.reset();
    this.cancelar.emit();
  }

  private limparCampos(dto: ConsultasFormAgendamentosModel): ConsultasFormAgendamentosModel {
    const copia = { ...dto };
    delete (copia as any).veterinarioNome;
    delete (copia as any).petNome;
    return copia;
  }
}
