import { InternacaoFacade } from './internacao.facade';
import { InternacaoResponseDTO } from '../../features/internacoes';

describe('InternacaoFacade', () => {
  let facade: InternacaoFacade;

  beforeEach(() => {
    facade = new InternacaoFacade();
  });

  it('should create with default state', () => {
    expect(facade).toBeTruthy();
    expect(facade.listLoading()).toBeFalse();
    expect(facade.detailLoading()).toBeFalse();
    expect(facade.evolucoesLoading()).toBeFalse();
    expect(facade.internacoes()).toEqual([]);
    expect(facade.selected()).toBeNull();
    expect(facade.activeTab()).toBe('resumo');
  });

  it('should filter internacoes by search text and status', () => {
    const items = [
      {
        id: 1,
        nome: 'Internacao - Thor',
        clinicaId: 1,
        petId: 1,
        petNome: 'Thor',
        veterinarioId: 2,
        veterinarioNome: 'Dra. Ana',
        origemTipo: 'CONSULTA',
        origemId: 10,
        dataHoraAdmissao: '2026-03-23T14:30:00',
        motivoInternacao: 'Monitoramento pós-procedimento cirúrgico',
        statusInternacao: 'ADMITIDO',
        internamento: true,
        pesoEntrada: 12.4,
        pesoAtual: 12.4,
        dataHoraAlta: null,
        resumoAlta: null,
        orientacoesAlta: null,
      },
      {
        id: 2,
        nome: 'Internacao - Luna',
        clinicaId: 1,
        petId: 2,
        petNome: 'Luna',
        veterinarioId: 3,
        veterinarioNome: 'Dr. Carlos',
        origemTipo: 'CIRURGIA',
        origemId: 22,
        dataHoraAdmissao: '2026-03-24T09:00:00',
        motivoInternacao: 'Recuperacao monitorada',
        statusInternacao: 'EM_TRATAMENTO',
        internamento: true,
        pesoEntrada: 8.1,
        pesoAtual: 8.3,
        dataHoraAlta: null,
        resumoAlta: null,
        orientacoesAlta: null,
      },
    ] as InternacaoResponseDTO[];

    facade.internacoes.set(items);
    facade.busca.set('thor');
    expect(facade.internacoesFiltradas().length).toBe(1);
    expect(facade.internacoesFiltradas()[0].petNome).toBe('Thor');

    facade.busca.set('');
    facade.filtroStatus.set('EM_TRATAMENTO');
    expect(facade.internacoesFiltradas().length).toBe(1);
    expect(facade.internacoesFiltradas()[0].petNome).toBe('Luna');
  });

  it('should compute allowed transitions and finalized state', () => {
    facade.selected.set({
      id: 3,
      nome: 'Internacao - Bob',
      clinicaId: 1,
      petId: 3,
      petNome: 'Bob',
      veterinarioId: 2,
      veterinarioNome: 'Dra. Ana',
      origemTipo: 'OUTRO',
      origemId: null,
      dataHoraAdmissao: '2026-03-24T10:00:00',
      motivoInternacao: 'Observacao intensiva do paciente',
      statusInternacao: 'ADMITIDO',
      internamento: true,
      pesoEntrada: null,
      pesoAtual: null,
      dataHoraAlta: null,
      resumoAlta: null,
      orientacoesAlta: null,
    });

    expect(facade.statusPermitidos()).toContain('EM_OBSERVACAO');
    expect(facade.selectedIsFinalizado()).toBeFalse();

    facade.selected.set({
      ...facade.selected()!,
      statusInternacao: 'ALTA_CONCLUIDA',
    });

    expect(facade.selectedIsFinalizado()).toBeTrue();
  });
});
