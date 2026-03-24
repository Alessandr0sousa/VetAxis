import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { OrigemTipo, StatusInternacao } from '@features/internacoes';

export type AdmissaoForm = FormGroup<{
  nome: FormControl<string>;
  petId: FormControl<number | null>;
  veterinarioId: FormControl<number | null>;
  origemTipo: FormControl<OrigemTipo>;
  dataHoraAdmissao: FormControl<string>;
  motivoInternacao: FormControl<string>;
  internamento: FormControl<boolean>;
  pesoEntrada: FormControl<number | null>;
  pesoAtual: FormControl<number | null>;
}>;

export type EvolucaoForm = FormGroup<{
  veterinarioId: FormControl<number | null>;
  dataHora: FormControl<string>;
  nomePaciente: FormControl<string>;
  especie: FormControl<string>;
  suspeitaClinica: FormControl<string>;
  tipoAlimentacao: FormControl<string>;
  quantidadeAlimentacao: FormControl<string>;
  formaAlimentacao: FormControl<string>;
  estadoGeral: FormControl<string>;
  exameSangue: FormControl<boolean>;
  exameFezesParasitologico: FormControl<boolean>;
  exameUrina: FormControl<boolean>;
  exameImagem: FormControl<boolean>;
  exameCardiologicos: FormControl<boolean>;
  trCelsius: FormControl<string>;
  fcBpm: FormControl<string>;
  frMpm: FormControl<string>;
  paMmhg: FormControl<string>;
  mucosa: FormControl<string>;
  urina: FormControl<string>;
  aspectoUrina: FormControl<string>;
  fezes: FormControl<string>;
  aspectoFezes: FormControl<string>;
  houveVisita: FormControl<string>;
  conversadoResponsavel: FormControl<string>;
  prognostico: FormControl<string>;
  indicacaoAlta: FormControl<string>;
  pcr: FormControl<string>;
  testesRapidos: FormControl<string>;
  qualPcrRealizado: FormControl<string>;
  conduta: FormControl<string>;
  proximaReavaliacao: FormControl<string>;
}>;

export type StatusForm = FormGroup<{
  novoStatus: FormControl<StatusInternacao | null>;
  justificativa: FormControl<string>;
}>;

export type AltaForm = FormGroup<{
  dataHoraAlta: FormControl<string>;
  condicaoAlta: FormControl<string>;
  resumoAlta: FormControl<string>;
  orientacoesTutor: FormControl<string>;
  retornoRecomendado: FormControl<boolean>;
  dataRetorno: FormControl<string>;
}>;

export function createAdmissaoForm(fb: FormBuilder, agora: string): AdmissaoForm {
  return fb.group({
    nome: fb.nonNullable.control(''),
    petId: fb.control<number | null>(null, Validators.required),
    veterinarioId: fb.control<number | null>(null, Validators.required),
    origemTipo: fb.nonNullable.control<OrigemTipo>('OUTRO', Validators.required),
    dataHoraAdmissao: fb.nonNullable.control(agora, Validators.required),
    motivoInternacao: fb.nonNullable.control('', [Validators.required, Validators.minLength(10)]),
    internamento: fb.nonNullable.control(true, Validators.requiredTrue),
    pesoEntrada: fb.control<number | null>(null),
    pesoAtual: fb.control<number | null>(null),
  });
}

export function createEvolucaoForm(fb: FormBuilder, agora: string): EvolucaoForm {
  return fb.group({
    veterinarioId: fb.control<number | null>(null, Validators.required),
    dataHora: fb.nonNullable.control(agora, Validators.required),
    nomePaciente: fb.nonNullable.control(''),
    especie: fb.nonNullable.control(''),
    suspeitaClinica: fb.nonNullable.control(''),
    tipoAlimentacao: fb.nonNullable.control(''),
    quantidadeAlimentacao: fb.nonNullable.control(''),
    formaAlimentacao: fb.nonNullable.control(''),
    estadoGeral: fb.nonNullable.control(''),
    exameSangue: fb.nonNullable.control(false),
    exameFezesParasitologico: fb.nonNullable.control(false),
    exameUrina: fb.nonNullable.control(false),
    exameImagem: fb.nonNullable.control(false),
    exameCardiologicos: fb.nonNullable.control(false),
    trCelsius: fb.nonNullable.control(''),
    fcBpm: fb.nonNullable.control(''),
    frMpm: fb.nonNullable.control(''),
    paMmhg: fb.nonNullable.control(''),
    mucosa: fb.nonNullable.control(''),
    urina: fb.nonNullable.control(''),
    aspectoUrina: fb.nonNullable.control(''),
    fezes: fb.nonNullable.control(''),
    aspectoFezes: fb.nonNullable.control(''),
    houveVisita: fb.nonNullable.control(''),
    conversadoResponsavel: fb.nonNullable.control(''),
    prognostico: fb.nonNullable.control(''),
    indicacaoAlta: fb.nonNullable.control(''),
    pcr: fb.nonNullable.control(''),
    testesRapidos: fb.nonNullable.control(''),
    qualPcrRealizado: fb.nonNullable.control(''),
    conduta: fb.nonNullable.control(''),
    proximaReavaliacao: fb.nonNullable.control(''),
  });
}

export function createStatusForm(fb: FormBuilder): StatusForm {
  return fb.group({
    novoStatus: fb.control<StatusInternacao | null>(null, Validators.required),
    justificativa: fb.nonNullable.control(''),
  });
}

export function createAltaForm(fb: FormBuilder, agora: string): AltaForm {
  return fb.group({
    dataHoraAlta: fb.nonNullable.control(agora, Validators.required),
    condicaoAlta: fb.nonNullable.control('', Validators.required),
    resumoAlta: fb.nonNullable.control('', Validators.required),
    orientacoesTutor: fb.nonNullable.control('', Validators.required),
    retornoRecomendado: fb.nonNullable.control(false, Validators.required),
    dataRetorno: fb.nonNullable.control(''),
  });
}
