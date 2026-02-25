import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, computed, signal } from '@angular/core';
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
import { AnexosUpload } from '../../shared/anexos-upload/anexos-upload';
import { EscalaVeterinariosService, EscalaVeterinariosItem } from '../../services/escala-veterinarios-service';
import { TipoAgendamento, TipoAgendamentoLabels } from '../../models/agendamentos-model';

type HorarioDisponivel = {
  horario: string;
  agendado: boolean;
};

@Component({
  selector: 'app-consultas-form-agendamentos',
  standalone: true,
  imports: [AgendaCalendario, CommonModule, ReactiveFormsModule, ConsultasList, AnexosUpload],
  templateUrl: './consultas-form-agendamentos.html',
  styleUrls: ['./consultas-form-agendamentos.scss'],
})
export class ConsultasFormAgendamentos implements OnInit {
  @Input() dto?: ConsultasFormAgendamentosModel;
  @Input() tipoAgendamento: TipoAgendamento = TipoAgendamento.CONSULTA;
  @Output() cancelar = new EventEmitter<void>();
  @Output() salvar = new EventEmitter<ConsultasFormAgendamentosModel>();
  @ViewChild(AnexosUpload) anexosUpload?: AnexosUpload;
  readonly tipoAgendamentoEnum = TipoAgendamento;
  readonly tipoAgendamentoLabels = TipoAgendamentoLabels;

  pets: Pet[] = [];
  vets: VeterinarioModel[] = [];
  form!: FormGroup;
  diaSelected: string = '';

  // Signals para gerenciar horários disponíveis
  readonly escalasVeterinario = signal<EscalaVeterinariosItem[]>([]);
  readonly agendamentosDodia = signal<ConsultasFormAgendamentosModel[]>([]);
  readonly diaSelecionadoNumero = signal<number | null>(null);

  readonly horariosDisponiveis = computed<HorarioDisponivel[]>(() => {
    const escalas = this.escalasVeterinario();
    const diaNumero = this.diaSelecionadoNumero();
    const agendamentos = this.agendamentosDodia();

    // Filtra apenas as escalas do dia selecionado
    const escalasDodia = escalas.filter((escala) => escala.dia === diaNumero);
    const horariosAgendados = new Set(agendamentos.map((a) => a.horario));

    if (escalasDodia.length === 0) return [];

    const horarios: HorarioDisponivel[] = [];
    for (const escala of escalasDodia) {
      const horas = this.gerarHorariosList(escala.horaInicio, escala.horaFim);
      for (const hora of horas) {
        const existe = horarios.find((h) => h.horario === hora);
        if (!existe) {
          horarios.push({
            horario: hora,
            agendado: horariosAgendados.has(hora),
          });
        }
      }
    }

    return horarios.sort((a, b) => a.horario.localeCompare(b.horario));
  });

  constructor(
    private fb: FormBuilder,
    private vetService: VeterinarioService,
    private petService: PetService,
    private agendamentoService: AgendamentosService,
    private escalaService: EscalaVeterinariosService,
    private swa: AlertService,
  ) {}

  ngOnInit(): void {
    this.form = this.criarForm();
    this.aplicarValidadoresPorTipo();
    this.listarPets();
    this.listarVeterinarios();
    this.diaSelected = new Date().toLocaleDateString('pt-BR');

    if (this.dto) {
      this.carregarDados();
    }

    this.form.valueChanges.subscribe((val) => {
      const nomeComposto = this.montarNomeAgendamento(val);
      this.form.get('nome')?.setValue(nomeComposto, { emitEvent: false });
    });

    // Monitora mudanças na data selecionada para carregar agendamentos do dia
    this.form.get('dia')?.valueChanges.subscribe((dia) => {
      if (dia && this.form.get('veterinario')?.value?.id) {
        // Extrai o número do dia
        const [diaNumeroBR] = dia.split('/');
        const diaNumero = parseInt(diaNumeroBR, 10);
        this.diaSelecionadoNumero.set(diaNumero);

        const vetId = this.form.get('veterinario')!.value.id;
        // Recarrega escala do mês selecionado
        this.carregarEscalaVeterinario(vetId, dia);
        // Carrega agendamentos do dia
        this.carregarAgendamentosDoDia(dia, vetId);
      }
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
      exame: this.fb.group({
        tipo: [''],
        descricao: [''],
        materialColetado: [''],
      }),
      cirurgia: this.fb.group({
        tipo: [''],
        descricao: [''],
        protocoloAnestesia: [''],
        internamento: [false],
      }),
      vacina: this.fb.group({
        tipo: [''],
        nome: [''],
        dose: [''],
      }),
      anexos: [[]],
    });
  }

  private aplicarValidadoresPorTipo(): void {
    const consultaAtiva = this.tipoAgendamento === TipoAgendamento.CONSULTA;
    const exameAtivo = this.tipoAgendamento === TipoAgendamento.EXAME;
    const cirurgiaAtiva = this.tipoAgendamento === TipoAgendamento.CIRURGIA;
    const vacinaAtiva = this.tipoAgendamento === TipoAgendamento.VACINA;

    this.configurarGrupo('consulta', consultaAtiva, {
      anamnese: [Validators.required, Validators.minLength(10)],
    });

    this.configurarGrupo('exame', exameAtivo, {
      tipo: [Validators.required],
      descricao: [Validators.required],
      materialColetado: [Validators.required],
      statusExame: [Validators.required],
    });

    this.configurarGrupo('cirurgia', cirurgiaAtiva, {
      tipo: [Validators.required],
      descricao: [Validators.required],
      anestesia: [Validators.required],
      protocoloAnestesia: [Validators.required],
      relaProcedimento: [Validators.required],
      statusCirurgia: [Validators.required],
    });

    this.configurarGrupo('vacina', vacinaAtiva, {
      tipo: [Validators.required],
      nome: [Validators.required],
      lote: [Validators.required],
      fabricante: [Validators.required],
      dataValidade: [Validators.required],
      statusVacina: [Validators.required],
    });
  }

  private configurarGrupo(
    nomeGrupo: string,
    ativo: boolean,
    validadores: Record<string, any[]>
  ): void {
    const grupo = this.form.get(nomeGrupo) as FormGroup | null;
    if (!grupo) return;

    if (ativo) {
      grupo.enable({ emitEvent: false });
      Object.entries(validadores).forEach(([campo, regras]) => {
        grupo.get(campo)?.setValidators(regras);
      });
    } else {
      Object.keys(grupo.controls).forEach((campo) => {
        grupo.get(campo)?.clearValidators();
      });
      grupo.disable({ emitEvent: false });
    }

    grupo.updateValueAndValidity({ emitEvent: false });
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
    this.form.patchValue({ dia }, { emitEvent: true });

    // Extrai o número do dia da data formatada (DD/MM/YYYY)
    const [diaNumeroBR] = dia.split('/');
    const diaNumero = parseInt(diaNumeroBR, 10);
    this.diaSelecionadoNumero.set(diaNumero);

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

  onHorarioClick(event: Event, horario: HorarioDisponivel): void {
    if (!horario.agendado) return;

    event.preventDefault();
    event.stopPropagation();

    const input = event.target as HTMLInputElement | null;
    if (input) {
      input.checked = false;
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

      // Carrega a escala do veterinário selecionado
      if (vetSelecionado?.id) {
        this.carregarEscalaVeterinario(vetSelecionado.id, this.diaSelected);

        // Carrega agendamentos do dia se já temos um dia selecionado
        if (this.diaSelected) {
          this.carregarAgendamentosDoDia(this.diaSelected, vetSelecionado.id);
        }
      }
    }

    if (tipo === 'pet') {
      const petSelecionado = this.pets.find((pet) => pet.nome === nomeSelecionado);
      this.form.get('pet')?.setValue(petSelecionado ?? null);
    }
  }

  salvarAgendamento() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const { anexos, ...outrosValores } = formValue;

      let agendaDto: ConsultasFormAgendamentosModel = {
        ...(this.dto ?? {}),
        ...outrosValores,
        veterinario: formValue.veterinario,
        pet: formValue.pet,
        isRetorno: formValue.isRetorno ?? false,
        tipo: this.tipoAgendamento,
      };

      if (this.tipoAgendamento !== TipoAgendamento.CONSULTA) {
        delete (agendaDto as any).consulta;
      }
      if (this.tipoAgendamento !== TipoAgendamento.EXAME) {
        delete (agendaDto as any).exame;
      }
      if (this.tipoAgendamento !== TipoAgendamento.CIRURGIA) {
        delete (agendaDto as any).cirurgia;
      }
      if (this.tipoAgendamento !== TipoAgendamento.VACINA) {
        delete (agendaDto as any).vacina;
      }

      agendaDto = this.limparCampos(agendaDto);

      const request$ = agendaDto.id
        ? this.agendamentoService.atualizar(agendaDto)
        : this.agendamentoService.salvar(agendaDto);

      request$.subscribe({
        next: (agendamentoSalvo) => {
          const mensagem = agendaDto.id
            ? 'Agendamento atualizado com sucesso!'
            : 'Agendamento salvo com sucesso!';
          this.swa.success(mensagem);

          // Salva anexos temporários após criação do agendamento
          if (agendamentoSalvo?.id && this.anexosUpload) {
            this.anexosUpload.salvarAnexosTemporarios(agendamentoSalvo.id);
          }

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

    // Usa a string do banco diretamente
    const dia = this.dto?.dia ?? new Date().toLocaleDateString('pt-BR');

    this.diaSelected = dia;

    // Extrai o número do dia
    const [diaNumeroBR] = dia.split('/');
    const diaNumero = parseInt(diaNumeroBR, 10);
    this.diaSelecionadoNumero.set(diaNumero);

    this.form.patchValue({
      veterinarioNome: this.dto?.veterinario?.nome ?? '',
      petNome: this.dto?.pet?.nome ?? '',
      pet: this.dto?.pet ?? null,
      veterinario: this.dto?.veterinario ?? null,
      peso: this.dto?.peso ?? 0,
      dia: dia,
      horario: this.dto?.horario ?? '',
      consultaOrigem: this.dto,
      isRetorno: this.dto?.isRetorno ?? false,
      consulta: {
        anamnese: this.dto?.consulta?.anamnese ?? '',
        status: StatusAgendamento.AGENDADO,
      },
    });

    // Carrega escala e agendamentos após popular o form
    if (this.dto?.veterinario?.id) {
      this.carregarEscalaVeterinario(this.dto.veterinario.id, dia);
      this.carregarAgendamentosDoDia(dia, this.dto.veterinario.id);
    }
  }

  cancelarAgendamento() {
    this.form.reset();
    this.cancelar.emit();
  }

  private carregarEscalaVeterinario(veterinarioId: number, diaFormatado?: string): void {
    let ano = new Date().getFullYear();
    let mes = new Date().getMonth() + 1;

    // Se uma data foi fornecida, usa o mês/ano dessa data
    if (diaFormatado) {
      const [, mesBR, anoBR] = diaFormatado.split('/');
      mes = parseInt(mesBR, 10);
      ano = parseInt(anoBR, 10);
    }

    this.escalaService.buscar(ano, mes, 1).subscribe({
      next: (response) => {
        // Filtra apenas as escalas do veterinário selecionado
        const escalasVet = (response.content ?? []).filter(
          (escala) => escala.veterinarioId === veterinarioId
        );
        this.escalasVeterinario.set(escalasVet);
      },
      error: () => {
        this.swa.error('Erro ao carregar escala do veterinário');
        this.escalasVeterinario.set([]);
      },
    });
  }

  private carregarAgendamentosDoDia(diaFormatado: string, veterinarioId: number): void {
    const dataISO = this.converterDataParaISO(diaFormatado);
    const valorPrimario = diaFormatado;

    this.agendamentoService
      .buscarPorCampo({
        campo: 'dia',
        valor: valorPrimario,
        page: 0,
        size: 50,
        sort: [],
      })
      .subscribe({
        next: (response) => {
          const agendamentosVet = (response.content ?? []).filter(
            (agendamento) => agendamento.veterinario?.id === veterinarioId
          );

          if (agendamentosVet.length > 0 || dataISO === valorPrimario) {
            this.agendamentosDodia.set(agendamentosVet);
            return;
          }

          this.agendamentoService
            .buscarPorCampo({
              campo: 'dia',
              valor: dataISO,
              page: 0,
              size: 50,
              sort: [],
            })
            .subscribe({
              next: (responseISO) => {
                const agendamentosVetISO = (responseISO.content ?? []).filter(
                  (agendamento) => agendamento.veterinario?.id === veterinarioId
                );
                this.agendamentosDodia.set(agendamentosVetISO);
              },
              error: () => {
                this.swa.error('Erro ao carregar agendamentos do dia');
                this.agendamentosDodia.set([]);
              },
            });
        },
        error: () => {
          this.swa.error('Erro ao carregar agendamentos do dia');
          this.agendamentosDodia.set([]);
        },
      });
  }

  private gerarHorariosList(horaInicio: string, horaFim: string): string[] {
    const horarios: string[] = [];
    const [hInicio, minInicio] = horaInicio.split(':').map(Number);
    const [hFim, minFim] = horaFim.split(':').map(Number);

    let totalMinInicio = hInicio * 60 + minInicio;
    const totalMinFim = hFim * 60 + minFim;
    const intervalo = 60; // 1 hora em minutos

    while (totalMinInicio < totalMinFim) {
      const horas = Math.floor(totalMinInicio / 60);
      const minutos = totalMinInicio % 60;
      horarios.push(
        `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`
      );
      totalMinInicio += intervalo;
    }

    return horarios;
  }

  private converterDataParaISO(dataBR: string): string {
    const [dia, mes, ano] = dataBR.split('/');
    return `${ano}-${mes}-${dia}`;
  }

  private limparCampos(dto: ConsultasFormAgendamentosModel): ConsultasFormAgendamentosModel {
    const copia = { ...dto };
    delete (copia as any).veterinarioNome;
    delete (copia as any).petNome;
    return copia;
  }
}
