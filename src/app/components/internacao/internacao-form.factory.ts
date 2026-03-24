import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { OrigemTipo, StatusInternacao } from '@features/internacoes';

export type AdmissaoForm = FormGroup<{
  nome: FormControl<string>;
  petId: FormControl<number | null>;
  veterinarioId: FormControl<number | null>;
  origemTipo: FormControl<OrigemTipo>;
  origemId: FormControl<number | null>;
  dataHoraAdmissao: FormControl<string>;
  motivoInternacao: FormControl<string>;
  internamento: FormControl<boolean>;
  pesoEntrada: FormControl<number | null>;
  pesoAtual: FormControl<number | null>;
}>;

export type EvolucaoForm = FormGroup<{
  veterinarioId: FormControl<number | null>;
  dataHora: FormControl<string>;
  descricao: FormControl<string>;
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
    origemTipo: fb.nonNullable.control<OrigemTipo>('CONSULTA', Validators.required),
    origemId: fb.control<number | null>(null),
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
    descricao: fb.nonNullable.control('', [Validators.required, Validators.minLength(10)]),
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
