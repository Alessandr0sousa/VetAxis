import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import {
  InternacaoEvolucaoResponseDTO,
  InternacaoResponseDTO,
  StatusInternacao,
} from '@features/internacoes';
import { formatarData, getStatusClass, getStatusLabel } from '../internacao-ui.utils';

@Component({
  selector: 'app-internacao-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './internacao-detail.html',
})
export class InternacaoDetail {
  readonly evolucaoSelecionada = signal<InternacaoEvolucaoResponseDTO | null>(null);

  private readonly examLabels: Record<string, string> = {
    SANGUE: '[SANGUE]',
    FEZES_PARASITOLOGICO: 'FEZES [PARASITOLÓGICO]',
    URINA: '[URINA]',
    IMAGEM: '[IMAGEM]',
    CARDIOLOGICOS: '[CARDIOLÓGICOS]',
  };

  private readonly sectionConfig: Array<{
    title: string;
    fields: Array<{ key: string; label: string }>;
  }> = [
    {
      title: 'Identificação',
      fields: [
        { key: 'nomePaciente', label: 'Nome paciente' },
        { key: 'especie', label: 'Espécie' },
      ],
    },
    {
      title: 'Avaliação Clínica',
      fields: [
        { key: 'suspeitaClinica', label: 'Suspeita clínica' },
        { key: 'tipoAlimentacao', label: 'Tipo de alimentação' },
        { key: 'quantidadeGramas', label: 'Quantidade (g)' },
        { key: 'forma', label: 'Forma' },
        { key: 'estadoGeral', label: 'Estado geral' },
      ],
    },
    {
      title: 'Sinais Vitais',
      fields: [
        { key: 'trCelsius', label: 'TR (ºC)' },
        { key: 'fcBpm', label: 'FC (bpm)' },
        { key: 'frMpm', label: 'FR (mpm)' },
        { key: 'paMmhg', label: 'PA (mmHg)' },
      ],
    },
    {
      title: 'Eliminações e Mucosas',
      fields: [
        { key: 'mucosa', label: 'Mucosa' },
        { key: 'urina', label: 'Urina' },
        { key: 'aspectoUrina', label: 'Aspecto (urina)' },
        { key: 'fezes', label: 'Fezes' },
        { key: 'aspectoFezes', label: 'Aspecto (fezes)' },
      ],
    },
    {
      title: 'Comunicação e Prognóstico',
      fields: [
        { key: 'houveVisita', label: 'Houve visita' },
        { key: 'conversadoResponsavel', label: 'Conversado com o responsável' },
        { key: 'prognostico', label: 'Prognóstico' },
        { key: 'indicacaoAlta', label: 'Indicação de alta' },
      ],
    },
    {
      title: 'PCR e Testes',
      fields: [
        { key: 'pcr', label: 'PCR' },
        { key: 'testesRapidos', label: 'Testes rápidos' },
        { key: 'qualPcrRealizado', label: 'Qual o PCR realizado' },
      ],
    },
  ];

  readonly detailLoading = input.required<boolean>();
  readonly selected = input<InternacaoResponseDTO | null>(null);
  readonly activeTab = input.required<'resumo' | 'evolucao' | 'alta'>();
  readonly selectedIsFinalizado = input.required<boolean>();

  readonly evolucoesLoading = input.required<boolean>();
  readonly evolucoes = input.required<InternacaoEvolucaoResponseDTO[]>();
  readonly evolucoesPage = input.required<number>();
  readonly evolucoesTotalPages = input.required<number>();

  readonly tabChange = output<'resumo' | 'evolucao' | 'alta'>();
  readonly abrirEvolucao = output<void>();
  readonly carregarEvolucoes = output<number>();
  readonly abrirAlta = output<void>();
  readonly abrirStatus = output<void>();
  readonly remover = output<number>();

  onTabChange(tab: 'resumo' | 'evolucao' | 'alta'): void {
    this.tabChange.emit(tab);
  }

  onAbrirEvolucao(): void {
    this.abrirEvolucao.emit();
  }

  onEvolucaoPageChange(page: number): void {
    this.carregarEvolucoes.emit(page);
  }

  onAbrirAlta(): void {
    this.abrirAlta.emit();
  }

  onAbrirStatus(): void {
    this.abrirStatus.emit();
  }

  onRemover(id: number): void {
    this.remover.emit(id);
  }

  abrirDetalhesEvolucao(evolucao: InternacaoEvolucaoResponseDTO): void {
    this.evolucaoSelecionada.set(evolucao);
  }

  fecharDetalhesEvolucao(): void {
    this.evolucaoSelecionada.set(null);
  }

  hasProximaReavaliacaoPendente(evolucao: InternacaoEvolucaoResponseDTO): boolean {
    if (!evolucao.proximaReavaliacao) {
      return false;
    }

    const reavaliacaoTs = new Date(evolucao.proximaReavaliacao).getTime();
    if (!Number.isFinite(reavaliacaoTs)) {
      return false;
    }

    return reavaliacaoTs > Date.now();
  }

  getResumoEvolucao(descricao: string): string {
    try {
      const parsed = JSON.parse(descricao) as Record<string, unknown>;
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        return descricao;
      }

      const nomePaciente = String(parsed['nomePaciente'] ?? '').trim();
      const estadoGeral = String(parsed['estadoGeral'] ?? '').trim();
      const suspeitaClinica = String(parsed['suspeitaClinica'] ?? '').trim();

      if (estadoGeral) return `Estado geral: ${estadoGeral}`;
      if (suspeitaClinica) return `Suspeita clínica: ${suspeitaClinica}`;
      if (nomePaciente) return `Paciente: ${nomePaciente}`;
      return 'Clique para visualizar a evolução completa.';
    } catch {
      return descricao || 'Clique para visualizar a evolução completa.';
    }
  }

  getEvolucaoQASections(evolucao: InternacaoEvolucaoResponseDTO): Array<{ title: string; items: Array<{ question: string; answer: string }> }> {
    const parsed = this.parseDescricaoToObject(evolucao.descricao);
    const examesSolicitados = Array.isArray(parsed['examesSolicitados'])
      ? parsed['examesSolicitados'].map((item) => String(item))
      : [];

    const yesNo = (code: string): string => (examesSolicitados.includes(code) ? 'Sim' : 'Não');
    const texto = (key: string): string => {
      const value = parsed[key];
      if (value === null || value === undefined) return 'Não informado';
      const text = String(value).trim();
      return text.length > 0 ? text : 'Não informado';
    };

    const sections: Array<{ title: string; items: Array<{ question: string; answer: string }> }> = [
      {
        title: 'Identificação',
        items: [
          { question: 'Nome paciente', answer: texto('nomePaciente') },
          { question: 'Espécie', answer: texto('especie') },
        ],
      },
      {
        title: 'Avaliação Clínica',
        items: [
          { question: 'Suspeita clínica', answer: texto('suspeitaClinica') },
          { question: 'Tipo de alimentação', answer: texto('tipoAlimentacao') },
          { question: 'Quantidade (g)', answer: texto('quantidadeGramas') },
          { question: 'Forma', answer: texto('forma') },
          { question: 'Estado geral', answer: texto('estadoGeral') },
        ],
      },
      {
        title: 'Solicitação de Exames',
        items: [
          { question: '[Sangue]', answer: yesNo('SANGUE') },
          { question: 'Fezes [Parasitológico]', answer: yesNo('FEZES_PARASITOLOGICO') },
          { question: '[Urina]', answer: yesNo('URINA') },
          { question: '[Imagem]', answer: yesNo('IMAGEM') },
          { question: '[Cardiológicos]', answer: yesNo('CARDIOLOGICOS') },
        ],
      },
      {
        title: 'Sinais Vitais',
        items: [
          { question: 'TR (ºC)', answer: texto('trCelsius') },
          { question: 'FC (bpm)', answer: texto('fcBpm') },
          { question: 'FR (mpm)', answer: texto('frMpm') },
          { question: 'PA (mmHg)', answer: texto('paMmhg') },
        ],
      },
      {
        title: 'Urina e Fezes',
        items: [
          { question: 'Mucosa', answer: texto('mucosa') },
          { question: 'Urina', answer: texto('urina') },
          { question: 'Aspecto (urina)', answer: texto('aspectoUrina') },
          { question: 'Fezes', answer: texto('fezes') },
          { question: 'Aspecto (fezes)', answer: texto('aspectoFezes') },
        ],
      },
      {
        title: 'Comunicação e Alta',
        items: [
          { question: 'Houve visita', answer: texto('houveVisita') },
          { question: 'O que foi conversado com o responsável', answer: texto('conversadoResponsavel') },
          { question: 'Prognóstico', answer: texto('prognostico') },
          { question: 'Indicação de alta', answer: texto('indicacaoAlta') },
        ],
      },
      {
        title: 'PCR e Testes',
        items: [
          { question: 'PCR', answer: texto('pcr') },
          { question: 'Testes rápidos', answer: texto('testesRapidos') },
          { question: 'Qual o PCR realizado', answer: texto('qualPcrRealizado') },
        ],
      },
      {
        title: 'Registro Clínico',
        items: [
          { question: 'Conduta', answer: evolucao.conduta?.trim() || 'Não informado' },
          {
            question: 'Próxima reavaliação',
            answer: evolucao.proximaReavaliacao ? this.formatarData(evolucao.proximaReavaliacao) : 'Não informado',
          },
        ],
      },
    ];

    return sections;
  }

  private parseDescricaoToObject(descricao: string): Record<string, unknown> {
    try {
      const parsed = JSON.parse(descricao) as Record<string, unknown>;
      if (parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
        return parsed;
      }
      return {};
    } catch {
      return {};
    }
  }

  getDescricaoSections(descricao: string): Array<{ title: string; lines: string[] }> {
    try {
      const parsed = JSON.parse(descricao) as Record<string, unknown>;
      if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
        return [{ title: 'Evolução', lines: [descricao] }];
      }

      const sections = this.sectionConfig
        .map((section) => {
          const lines = section.fields
            .map(({ key, label }) => {
              const value = parsed[key];
              if (value === null || value === undefined) return null;

              const text = String(value).trim();
              if (!text) return null;
              return `${label}: ${text}`;
            })
            .filter((line): line is string => !!line);

          return { title: section.title, lines };
        })
        .filter((section) => section.lines.length > 0);

      const examesRaw = parsed['examesSolicitados'];
      if (Array.isArray(examesRaw) && examesRaw.length > 0) {
        const exames = examesRaw
          .map((code) => this.examLabels[String(code)] ?? String(code))
          .filter((item) => item.length > 0);

        if (exames.length > 0) {
          sections.splice(2, 0, {
            title: 'Solicitação de Exames',
            lines: exames,
          });
        }
      }

      if (sections.length > 0) {
        return sections;
      }

      return [{ title: 'Evolução', lines: [descricao] }];
    } catch {
      const lines = descricao
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      return [{ title: 'Evolução', lines: lines.length > 0 ? lines : [descricao] }];
    }
  }

  getStatusLabel = getStatusLabel;
  getStatusClass = getStatusClass;
  formatarData = formatarData;
}
