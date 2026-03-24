import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Pet } from '../models/pet';
import { VeterinarioModel } from '../models/veterinario-model';
import { PetService } from '@features/pets';
import { VeterinarioService } from '@features/veterinarios';
import {
  InternacaoAltaRequestDTO,
  InternacaoEvolucaoResponseDTO,
  InternacaoEvolucaoRequestDTO,
  InternacaoResponseDTO,
  InternacaoService,
  InternacaoStatusRequestDTO,
  OrigemTipo,
  StatusInternacao,
} from '@features/internacoes';
import { AlertService } from '@shared/services';
import { InternacaoSidebarFilters } from './internacao-sidebar-filters/internacao-sidebar-filters';
import { InternacaoPatientList } from './internacao-patient-list/internacao-patient-list';
import { InternacaoDetail } from './internacao-detail/internacao-detail';
import { InternacaoModalAdmissao } from './internacao-modal-admissao/internacao-modal-admissao';
import { InternacaoModalEvolucao } from './internacao-modal-evolucao/internacao-modal-evolucao';
import { InternacaoModalStatus } from './internacao-modal-status/internacao-modal-status';
import { InternacaoModalAlta } from './internacao-modal-alta/internacao-modal-alta';
import { getStatusClass, getStatusLabel } from './internacao-ui.utils';
import { InternacaoFacade } from './internacao.facade';
import {
  createAdmissaoForm,
  createAltaForm,
  createEvolucaoForm,
  createStatusForm,
} from './internacao-form.factory';

@Component({
  selector: 'app-internacao',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InternacaoSidebarFilters,
    InternacaoPatientList,
    InternacaoDetail,
    InternacaoModalAdmissao,
    InternacaoModalEvolucao,
    InternacaoModalStatus,
    InternacaoModalAlta,
  ],
  providers: [InternacaoFacade],
  templateUrl: './internacao.html',
  styleUrl: './internacao.scss',
})
export class Internacao {
  private readonly internacaoService = inject(InternacaoService);
  private readonly petService = inject(PetService);
  private readonly veterinarioService = inject(VeterinarioService);
  private readonly alertService = inject(AlertService);
  private readonly fb = inject(FormBuilder);
  private readonly facade = inject(InternacaoFacade);

  readonly pets = signal<Pet[]>([]);
  readonly veterinarios = signal<VeterinarioModel[]>([]);

  readonly listLoading = this.facade.listLoading;
  readonly detailLoading = this.facade.detailLoading;
  readonly evolucoesLoading = this.facade.evolucoesLoading;
  readonly internacoes = this.facade.internacoes;
  readonly evolucoes = this.facade.evolucoes;
  readonly selected = this.facade.selected;
  readonly listPage = this.facade.listPage;
  readonly listTotalPages = this.facade.listTotalPages;
  readonly evolucoesPage = this.facade.evolucoesPage;
  readonly evolucoesTotalPages = this.facade.evolucoesTotalPages;
  readonly filtroStatus = this.facade.filtroStatus;
  readonly busca = this.facade.busca;
  readonly activeTab = this.facade.activeTab;
  readonly modalNovaInternacao = this.facade.modalNovaInternacao;
  readonly modalNovaEvolucao = this.facade.modalNovaEvolucao;
  readonly modalAlterarStatus = this.facade.modalAlterarStatus;
  readonly modalAlta = this.facade.modalAlta;

  readonly origemTipos: OrigemTipo[] = ['CONSULTA', 'CIRURGIA', 'OUTRO'];
  readonly statusOptions: StatusInternacao[] = [
    'PRE_INTERNACAO',
    'ADMITIDO',
    'EM_OBSERVACAO',
    'EM_TRATAMENTO',
    'POS_CIRURGICO',
    'AGUARDANDO_ALTA',
    'ALTA_CONCLUIDA',
    'OBITO',
  ];

  readonly internacoesFiltradas = this.facade.internacoesFiltradas;
  readonly statusPermitidos = this.facade.statusPermitidos;
  readonly selectedIsFinalizado = this.facade.selectedIsFinalizado;

  readonly admissaoForm = createAdmissaoForm(this.fb, this.getNowLocalDateTime());
  readonly evolucaoForm = createEvolucaoForm(this.fb, this.getNowLocalDateTime());
  readonly statusForm = createStatusForm(this.fb);
  readonly altaForm = createAltaForm(this.fb, this.getNowLocalDateTime());

  ngOnInit(): void {
    this.carregarDadosAuxiliares();
    this.carregarInternacoes();
  }

  carregarInternacoes(page = this.listPage()): void {
    this.listLoading.set(true);
    this.internacaoService.listar(page, 20, 'dataHoraAdmissao,desc').subscribe({
      next: (res) => {
        this.internacoes.set(res.content ?? []);
        this.listPage.set(res.pageable?.pageNumber ?? res.number ?? page);
        this.listTotalPages.set(res.totalPages ?? 1);
        this.listLoading.set(false);
      },
      error: () => {
        this.listLoading.set(false);
        this.alertService.error('Erro ao carregar internações');
      },
    });
  }

  carregarDetalhe(id: number): void {
    this.detailLoading.set(true);
    this.internacaoService.detalhar(id).subscribe({
      next: (res) => {
        this.selected.set(res);
        this.detailLoading.set(false);
        this.activeTab.set('resumo');
        this.carregarEvolucoes(0);
      },
      error: () => {
        this.detailLoading.set(false);
        this.alertService.error('Erro ao carregar detalhes da internação');
      },
    });
  }

  carregarEvolucoes(page = this.evolucoesPage()): void {
    const item = this.selected();
    if (!item) return;

    this.evolucoesLoading.set(true);
    this.internacaoService.listarEvolucoes(item.id, page, 20).subscribe({
      next: (res) => {
        this.evolucoes.set(res.content ?? []);
        this.evolucoesPage.set(res.pageable?.pageNumber ?? res.number ?? page);
        this.evolucoesTotalPages.set(res.totalPages ?? 1);
        this.evolucoesLoading.set(false);
      },
      error: () => {
        this.evolucoesLoading.set(false);
        this.alertService.error('Erro ao carregar evoluções');
      },
    });
  }

  onBuscarChange(value: string): void {
    this.busca.set(value);
  }

  onFiltroStatusChange(value: string): void {
    this.filtroStatus.set((value as StatusInternacao) || '');
  }

  abrirModalNovaInternacao(): void {
    this.admissaoForm.reset({
      nome: '',
      petId: null,
      veterinarioId: null,
      origemTipo: 'CONSULTA',
      origemId: null,
      dataHoraAdmissao: this.getNowLocalDateTime(),
      motivoInternacao: '',
      internamento: true,
      pesoEntrada: null,
      pesoAtual: null,
    });
    this.modalNovaInternacao.set(true);
  }

  fecharModalNovaInternacao(): void {
    this.modalNovaInternacao.set(false);
  }

  salvarNovaInternacao(): void {
    if (this.admissaoForm.invalid) {
      this.admissaoForm.markAllAsTouched();
      return;
    }

    const value = this.admissaoForm.getRawValue();
    const payload = {
      nome: value.nome || undefined,
      petId: Number(value.petId),
      veterinarioId: Number(value.veterinarioId),
      origemTipo: value.origemTipo!,
      origemId: value.origemId ? Number(value.origemId) : null,
      dataHoraAdmissao: value.dataHoraAdmissao!,
      motivoInternacao: value.motivoInternacao!,
      internamento: true as const,
      pesoEntrada: this.parseNumero(value.pesoEntrada),
      pesoAtual: this.parseNumero(value.pesoAtual),
    };

    this.internacaoService.admitir(payload).subscribe({
      next: (res) => {
        this.alertService.success('Paciente admitido com sucesso');
        this.modalNovaInternacao.set(false);
        this.carregarInternacoes(0);
        this.carregarDetalhe(res.id);
      },
      error: (error) => {
        this.alertService.error(error?.error?.message || 'Erro ao admitir paciente');
      },
    });
  }

  abrirModalEvolucao(): void {
    if (this.selectedIsFinalizado()) {
      this.alertService.warning('Não é possível adicionar evolução para internação encerrada');
      return;
    }

    this.evolucaoForm.reset({
      veterinarioId: this.selected()?.veterinarioId ?? null,
      dataHora: this.getNowLocalDateTime(),
      descricao: '',
      conduta: '',
      proximaReavaliacao: '',
    });
    this.modalNovaEvolucao.set(true);
  }

  fecharModalEvolucao(): void {
    this.modalNovaEvolucao.set(false);
  }

  salvarEvolucao(): void {
    const item = this.selected();
    if (!item) return;

    if (this.evolucaoForm.invalid) {
      this.evolucaoForm.markAllAsTouched();
      return;
    }

    const value = this.evolucaoForm.getRawValue();

    if (
      value.proximaReavaliacao &&
      new Date(value.proximaReavaliacao).getTime() <= new Date(value.dataHora!).getTime()
    ) {
      this.alertService.warning('A próxima reavaliação deve ser posterior ao registro da evolução');
      return;
    }

    const payload: InternacaoEvolucaoRequestDTO = {
      veterinarioId: Number(value.veterinarioId),
      dataHora: value.dataHora!,
      descricao: value.descricao!,
      conduta: value.conduta || undefined,
      proximaReavaliacao: value.proximaReavaliacao || undefined,
    };

    this.internacaoService.registrarEvolucao(item.id, payload).subscribe({
      next: () => {
        this.alertService.success('Evolução registrada com sucesso');
        this.modalNovaEvolucao.set(false);
        this.carregarEvolucoes(0);
      },
      error: (error) => {
        this.alertService.error(error?.error?.message || 'Erro ao registrar evolução');
      },
    });
  }

  abrirModalStatus(): void {
    if (this.selectedIsFinalizado()) {
      this.alertService.warning('Não é possível alterar status de internação encerrada');
      return;
    }

    this.statusForm.reset({
      novoStatus: null,
      justificativa: '',
    });
    this.modalAlterarStatus.set(true);
  }

  fecharModalStatus(): void {
    this.modalAlterarStatus.set(false);
  }

  salvarStatus(): void {
    const item = this.selected();
    if (!item) return;

    if (this.statusForm.invalid) {
      this.statusForm.markAllAsTouched();
      return;
    }

    const value = this.statusForm.getRawValue();
    const payload: InternacaoStatusRequestDTO = {
      novoStatus: value.novoStatus!,
      justificativa: value.justificativa || undefined,
    };

    this.internacaoService.alterarStatus(item.id, payload).subscribe({
      next: (res) => {
        this.alertService.success('Status alterado com sucesso');
        this.modalAlterarStatus.set(false);
        this.selected.set(res);
        this.carregarInternacoes(this.listPage());
      },
      error: (error) => {
        this.alertService.error(error?.error?.message || 'Erro ao alterar status');
      },
    });
  }

  abrirModalAlta(): void {
    if (this.selectedIsFinalizado()) {
      this.alertService.warning('Internação já encerrada');
      return;
    }

    this.altaForm.reset({
      dataHoraAlta: this.getNowLocalDateTime(),
      condicaoAlta: '',
      resumoAlta: '',
      orientacoesTutor: '',
      retornoRecomendado: false,
      dataRetorno: '',
    });
    this.modalAlta.set(true);
  }

  fecharModalAlta(): void {
    this.modalAlta.set(false);
  }

  salvarAlta(): void {
    const item = this.selected();
    if (!item) return;

    if (this.altaForm.invalid) {
      this.altaForm.markAllAsTouched();
      return;
    }

    const value = this.altaForm.getRawValue();

    if (value.retornoRecomendado && !value.dataRetorno) {
      this.alertService.warning('Informe a data de retorno quando o retorno for recomendado');
      return;
    }

    if (new Date(value.dataHoraAlta!).getTime() < new Date(item.dataHoraAdmissao).getTime()) {
      this.alertService.warning('A data/hora da alta deve ser posterior à admissão');
      return;
    }

    const payload: InternacaoAltaRequestDTO = {
      dataHoraAlta: value.dataHoraAlta!,
      condicaoAlta: value.condicaoAlta!,
      resumoAlta: value.resumoAlta!,
      orientacoesTutor: value.orientacoesTutor!,
      retornoRecomendado: !!value.retornoRecomendado,
      dataRetorno: value.retornoRecomendado ? value.dataRetorno! : null,
    };

    this.internacaoService.darAlta(item.id, payload).subscribe({
      next: (res) => {
        this.alertService.success('Alta registrada com sucesso');
        this.modalAlta.set(false);
        this.selected.set(res);
        this.carregarInternacoes(this.listPage());
      },
      error: (error) => {
        this.alertService.error(error?.error?.message || 'Erro ao registrar alta');
      },
    });
  }

  removerInternacao(id: number): void {
    this.alertService.confirm('Deseja remover esta internação?', 'Confirmação').then((ok) => {
      if (!ok) return;
      this.internacaoService.remover(id).subscribe({
        next: () => {
          this.alertService.success('Internação removida com sucesso');
          if (this.selected()?.id === id) {
            this.selected.set(null);
            this.evolucoes.set([]);
          }
          this.carregarInternacoes(this.listPage());
        },
        error: (error) => {
          this.alertService.error(error?.error?.message || 'Erro ao remover internação');
        },
      });
    });
  }

  setTab(tab: 'resumo' | 'evolucao' | 'alta'): void {
    this.activeTab.set(tab);
    if (tab === 'evolucao') {
      this.carregarEvolucoes(this.evolucoesPage());
    }
  }

  getStatusLabel(status: StatusInternacao): string {
    return getStatusLabel(status);
  }

  getStatusClass(status: StatusInternacao): string {
    return getStatusClass(status);
  }

  formatarData(date: string | null | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('pt-BR');
  }

  private carregarDadosAuxiliares(): void {
    this.petService.listar(0, 200).subscribe({
      next: (res) => this.pets.set(res.content ?? []),
      error: () => this.alertService.warning('Não foi possível carregar os pets'),
    });

    this.veterinarioService.listar(0, 200).subscribe({
      next: (res) => this.veterinarios.set(res.content ?? []),
      error: () => this.alertService.warning('Não foi possível carregar os veterinários'),
    });
  }

  private parseNumero(valor: unknown): number | null {
    if (valor === null || valor === undefined || valor === '') return null;
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero <= 0) return null;
    return numero;
  }

  private getNowLocalDateTime(): string {
    const agora = new Date();
    const tzOffset = agora.getTimezoneOffset() * 60000;
    return new Date(agora.getTime() - tzOffset).toISOString().slice(0, 16);
  }

}
