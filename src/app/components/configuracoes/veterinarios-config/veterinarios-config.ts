import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../services/alert-service';
import { VeterinarioModel } from '../../models/veterinario-model';
import { VeterinarioService } from '../../services/veterinario-service';
import {
  EscalaVeterinariosItem,
  EscalaVeterinariosService,
} from '../../services/escala-veterinarios-service';

type DiaEscala = {
  diaNumero: number;
  data: string;
  diaSemana: string;
};

type CelulaCalendario = DiaEscala | null;

@Component({
  selector: 'app-veterinarios-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './veterinarios-config.html',
  styleUrl: './veterinarios-config.scss',
})
export class VeterinariosConfig implements OnInit {
  private readonly veterinarioService = inject(VeterinarioService);
  private readonly escalaService = inject(EscalaVeterinariosService);
  private readonly alertService = inject(AlertService);
  private readonly fb = inject(FormBuilder);

  readonly veterinarios = signal<VeterinarioModel[]>([]);
  readonly veterinarioSelecionado = signal<VeterinarioModel | null>(null);
  readonly anoSelecionado = signal<number | null>(null);
  readonly mesSelecionado = signal<number | null>(null);
  readonly escalasMes = signal<EscalaVeterinariosItem[]>([]);
  readonly mostrarEscalasCarregadas = signal(false);

  readonly meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Marco' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  readonly anosDisponiveis = computed(() => {
    const anoAtual = new Date().getFullYear();
    return [anoAtual - 1, anoAtual, anoAtual + 1, anoAtual + 2];
  });

  readonly diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  readonly diasDoMes = computed<DiaEscala[]>(() => {
    const ano = this.anoSelecionado();
    const mes = this.mesSelecionado();
    if (!ano || !mes) return [];

    const totalDias = new Date(ano, mes, 0).getDate();
    const dias: DiaEscala[] = [];

    for (let dia = 1; dia <= totalDias; dia++) {
      const data = this.formatarData(ano, mes, dia);
      const diaSemana = this.obterDiaSemana(ano, mes, dia);
      dias.push({ diaNumero: dia, data, diaSemana });
    }

    return dias;
  });

  readonly celulasCalendario = computed<CelulaCalendario[]>(() => {
    const ano = this.anoSelecionado();
    const mes = this.mesSelecionado();
    if (!ano || !mes) return [];

    // Descobre que dia da semana é o primeiro dia do mês (0 = domingo, 6 = sábado)
    const primeiroDia = new Date(ano, mes - 1, 1).getDay();

    // Cria células vazias para os dias antes do início do mês
    const celulas: CelulaCalendario[] = Array(primeiroDia).fill(null);

    // Adiciona todos os dias do mês
    celulas.push(...this.diasDoMes());

    return celulas;
  });

  readonly escalasPorDia = computed(() => {
    const mapa = new Map<number, EscalaVeterinariosItem[]>();
    for (const item of this.escalasMes()) {
      const lista = mapa.get(item.dia) ?? [];
      lista.push(item);
      mapa.set(item.dia, lista);
    }
    return mapa;
  });

  readonly veterinariosMap = computed(() => {
    const mapa = new Map<number, string>();
    for (const vet of this.veterinarios()) {
      mapa.set(vet.id!, vet.nome ?? '');
    }
    return mapa;
  });

  readonly form: FormGroup = this.fb.group({
    veterinarioNome: [''],
    veterinarioId: [null, Validators.required],
    ano: [null, Validators.required],
    mesNome: [''],
    mes: [null, Validators.required],
    clinicaId: [1, Validators.required],
    dias: this.fb.array([]),
  });

  ngOnInit(): void {
    const anoAtual = new Date().getFullYear();
    this.anoSelecionado.set(anoAtual);
    this.form.patchValue({ ano: anoAtual, clinicaId: 1 });
    this.carregarVeterinarios();
  }

  get diasForm(): FormArray {
    return this.form.get('dias') as FormArray;
  }

  onVeterinarioInput(valor: string): void {
    const nome = valor.trim().toLowerCase();
    const encontrado = this.veterinarios().find(
      (vet) => vet.nome?.toLowerCase() === nome,
    );
    this.veterinarioSelecionado.set(encontrado ?? null);
    this.form.patchValue({
      veterinarioNome: valor,
      veterinarioId: encontrado?.id ?? null,
    });
  }

  onAnoInput(valor: string): void {
    const ano = Number(valor);
    const valido = Number.isFinite(ano) ? ano : null;
    this.anoSelecionado.set(valido);
    this.form.patchValue({ ano: valido });
    this.carregarEscalasMes();
  }

  onMesInput(valor: string): void {
    const nome = valor.trim();
    const encontrado = this.meses.find(
      (m) => m.label.toLowerCase() === nome.toLowerCase(),
    );
    this.mesSelecionado.set(encontrado?.value ?? null);
    this.form.patchValue({
      mesNome: valor,
      mes: encontrado?.value ?? null,
    });
    this.carregarEscalasMes();
  }

  getEscalasDoDia(diaNumero: number): EscalaVeterinariosItem[] {
    return this.escalasPorDia().get(diaNumero) ?? [];
  }

  getNomeVeterinario(veterinarioId: number): string {
    const nomeCompleto = this.veterinariosMap().get(veterinarioId) ?? 'Veterinário não encontrado';
    return this.formatarNomeAbreviado(nomeCompleto);
  }

  private formatarNomeAbreviado(nomeCompleto: string): string {
    if (!nomeCompleto || nomeCompleto === 'Veterinário não encontrado') {
      return nomeCompleto;
    }

    const partes = nomeCompleto.trim().split(/\s+/);

    if (partes.length === 1) {
      return partes[0];
    }

    const primeiroNome = partes[0];
    const iniciaisSobrenomes = partes
      .slice(1)
      .map(parte => parte.charAt(0).toUpperCase() + '.')
      .join(' ');

    return `${primeiroNome} ${iniciaisSobrenomes}`;
  }

  getTotalHorariosDia(diaNumero: number): number {
    const escalasExistentes = this.getEscalasDoDia(diaNumero).length;
    const diaControl = this.diasForm.controls.find(
      (control) => control.get('dia')?.value === diaNumero,
    );
    const horariosEmEdicao = diaControl
      ? this.getHorarios(diaControl as FormGroup).length
      : 0;
    return escalasExistentes + horariosEmEdicao;
  }

  canAdicionarHorario(diaNumero: number): boolean {
    return this.getTotalHorariosDia(diaNumero) < 4;
  }

  private carregarEscalasMes(): void {
    const ano = this.anoSelecionado();
    const mes = this.mesSelecionado();
    const clinicaId = Number(this.form.get('clinicaId')?.value) || 1;
    if (!ano || !mes) {
      this.escalasMes.set([]);
      return;
    }

    this.escalaService.buscar(ano, mes, clinicaId).subscribe({
      next: (data) => this.escalasMes.set(data.content ?? []),
      error: () => {
        this.escalasMes.set([]);
        this.alertService.error('Erro ao carregar escala dos veterinarios.');
      },
    });
  }

  private carregarVeterinarios(): void {
    this.veterinarioService.listar(0, 200).subscribe({
      next: (data) => (this.veterinarios.set(data.content ?? [])),
      error: () => this.alertService.error('Erro ao carregar veterinarios'),
    });
  }

  toggleDia(diaNumero: number): void {
    const index = this.diasForm.controls.findIndex(
      (control) => control.get('dia')?.value === diaNumero,
    );

    if (index >= 0) {
      this.diasForm.removeAt(index);
      return;
    }

    const escalasExistentes = this.getEscalasDoDia(diaNumero).length;

    if (escalasExistentes >= 4) {
      this.alertService.warning('Este dia já possui 4 horários cadastrados. Não é possível adicionar mais.');
      return;
    }

    this.diasForm.push(
      this.fb.group({
        dia: [diaNumero, Validators.required],
        horarios: this.fb.array([this.criarHorario()]),
      }),
    );
  }

  isDiaSelecionado(diaNumero: number): boolean {
    return this.diasForm.controls.some(
      (control) => control.get('dia')?.value === diaNumero,
    );
  }

  getHorarios(control: FormGroup): FormArray {
    return control.get('horarios') as FormArray;
  }

  asDiaFormGroup(control: any): FormGroup {
    return control as FormGroup;
  }

  formatarHoraInput(event: Event, control: any, campo: 'horaInicio' | 'horaFim'): void {
    const input = event.target as HTMLInputElement;
    const valor = input.value.replace(/\D/g, ''); // Remove tudo que não é número

    if (valor.length === 0) {
      control.get(campo)?.setValue('', { emitEvent: false });
      return;
    }

    let horas = '';
    let minutos = '';

    if (valor.length <= 2) {
      horas = valor;
    } else {
      horas = valor.substring(0, 2);
      minutos = valor.substring(2, 4);
    }

    // Valida horas (00-23)
    if (parseInt(horas) > 23) {
      horas = '23';
    }

    // Valida minutos (00-59)
    if (minutos && parseInt(minutos) > 59) {
      minutos = '59';
    }

    const horaFormatada = minutos ? `${horas}:${minutos}` : horas;
    control.get(campo)?.setValue(horaFormatada, { emitEvent: false });

    // Atualiza a posição do cursor
    const novaPosicao = horaFormatada.length;
    setTimeout(() => {
      input.setSelectionRange(novaPosicao, novaPosicao);
    }, 0);
  }

  adicionarHorario(control: FormGroup): void {
    const diaNumero = control.get('dia')?.value;
    const totalHorarios = this.getTotalHorariosDia(diaNumero);

    if (totalHorarios >= 4) {
      this.alertService.warning('Máximo de 4 horários por dia (incluindo escalas já cadastradas).');
      return;
    }

    const horarios = this.getHorarios(control);
    horarios.push(this.criarHorario());
  }

  removerHorario(control: FormGroup, index: number): void {
    this.getHorarios(control).removeAt(index);
  }

  salvarEscala(): void {
    if (this.form.invalid) {
      this.alertService.warning('Preencha os campos obrigatorios antes de salvar.');
      return;
    }

    if (this.diasForm.length === 0) {
      this.alertService.warning('Selecione ao menos um dia para a escala.');
      return;
    }

    const payload = this.montarPayload();
    this.escalaService.salvar(payload).subscribe({
      next: () => {
        this.alertService.success('Escala salva com sucesso!');
        // Limpar dados em edição
        while (this.diasForm.length > 0) {
          this.diasForm.removeAt(0);
        }
        // Recarregar escalas do veterinário e período selecionado
        this.mostrarEscalasCarregadas.set(true);
        this.carregarEscalasMes();
      },
      error: () => this.alertService.error('Erro ao salvar escala'),
    });
  }

  private montarPayload(): {
    mes: number;
    ano: number;
    veterinarioId: number;
    clinicaId: number;
    dias: { dia: number; horarios: { horaInicio: string; horaFim: string }[] }[];
  } {
    const { ano, mes, veterinarioId, clinicaId } = this.form.value;
    const dias = this.diasForm.controls.map((control) => {
      const horarios = this.getHorarios(control as FormGroup).controls.map((h) => ({
        horaInicio: h.get('horaInicio')?.value,
        horaFim: h.get('horaFim')?.value,
      }));

      return {
        dia: control.get('dia')?.value,
        horarios,
      };
    });

    return {
      mes,
      ano,
      veterinarioId,
      clinicaId,
      dias,
    };
  }

  private criarHorario(): FormGroup {
    return this.fb.group({
      horaInicio: ['', Validators.required],
      horaFim: ['', Validators.required],
    });
  }

  private formatarData(ano: number, mes: number, dia: number): string {
    const diaStr = String(dia).padStart(2, '0');
    const mesStr = String(mes).padStart(2, '0');
    return `${diaStr}/${mesStr}/${ano}`;
  }

  private obterDiaSemana(ano: number, mes: number, dia: number): string {
    const data = new Date(ano, mes - 1, dia);
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
    return diasSemana[data.getDay()];
  }

}
