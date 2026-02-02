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
    private agendamentoService: AgendamentosService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: [''],
      veterinario: [''],
      veterinarioNome: ['', Validators.required],
      dia: ['', Validators.required],
      horario: ['', Validators.required],
      pet: [''],
      petNome: ['', Validators.required],
      isRetorno: [false],
      peso: [0, [Validators.required, Validators.min(0)]],
      consultaOrigem: [null],
      consulta: this.fb.group({
        anamnese: ['', [Validators.required, Validators.minLength(10)]],
        status: [StatusAgendamento.AGENDADO],
      }),
    });

    this.listarPets();
    this.listarVeterinarios();
    this.diaSelected = new Date().toLocaleDateString('pt-BR');

    this.form.valueChanges.subscribe((val) => {
      const nomeComposto = this.montarNomeAgendamento(val);
      this.form.get('nome')?.setValue(nomeComposto, { emitEvent: false });
    });
  }

  montarNomeAgendamento(val: any) {
    const petnome = val.petNome || '';
    const dia = val.dia || '';
    const hora = val.horario || '';
    return [petnome, dia, hora].filter(Boolean).join('-');
  }

  get horarios() {
    return this.form.get('horarios') as FormArray;
  }

  atualizarDiaSelecionado(dia: string): string {
    this.diaSelected = dia;
    return this.diaSelected
  }

  toggleHorario(horario: string, event: any) {
    if (event.target.checked) {
      this.horarios.push(this.fb.control(horario));
    } else {
      const index = this.horarios.controls.findIndex((x) => x.value === horario);
      this.horarios.removeAt(index);
    }
  }

  listarVeterinarios() {
    this.vetService.listar(0, 10).subscribe({
      next: (data) => (this.vets = data.content ?? []),
      error: (err) => console.error('Erro ao carregar Veterinarios', err),
    });
  }

  listarPets() {
    this.petService.listar(0, 10).subscribe({
      next: (data) => (this.pets = data.content ?? []),
      error: (err) => console.error('Erro ao carregar Pets', err),
    });
  }

  onChangeSelecionado(event: Event, tipo: 'vet' | 'pet') {
    const input = event.target as HTMLInputElement;
    const nomeSelecionado = input.value;

    if (tipo === 'vet') {
      const vetSelecionado = this.vets.find((vet) => vet.nome === nomeSelecionado);

      if (vetSelecionado) {
        this.form.get('veterinario')?.setValue(vetSelecionado);
      } else {
        this.form.get('veterinario')?.setValue(null);
      }
    }

    if (tipo === 'pet') {
      const petSelecionado = this.pets.find((pet) => pet.nome === nomeSelecionado);

      if (petSelecionado) {
        this.form.get('pet')?.setValue(petSelecionado);
      } else {
        this.form.get('pet')?.setValue(null);
      }
    }
  }

  salvarAgendamento() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const agendaDto: ConsultasFormAgendamentosModel = {
        ...(this.dto ?? {}),
        ...formValue,
        veterinario: formValue.veterinario,
        pet: formValue.pet,
        isRetorno: formValue.isRetorno ?? false,
      };

      delete (agendaDto as any).veterinarioNome;
      delete (agendaDto as any).petNome;

      this.agendamentoService.salvar(agendaDto).subscribe({
        next: () => {
          alert('Agendamento salvo com sucesso! ');
        },
        error: (err) => {
          console.error('Erro ao salvar agendamento', err);
          alert('Erro ao salvar agendamento');
        },
      });
    }
  }

  cancelarAgendamento() {
    this.form.reset();
    this.cancelar.emit();
  }
}
