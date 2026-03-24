import { FormBuilder } from '@angular/forms';
import {
  createAdmissaoForm,
  createAltaForm,
  createEvolucaoForm,
  createStatusForm,
} from './internacao-form.factory';

describe('Internacao Form Factory', () => {
  const fb = new FormBuilder();
  const agora = '2026-03-24T10:30';

  it('should create admissao form with defaults and validators', () => {
    const form = createAdmissaoForm(fb, agora);

    expect(form.get('origemTipo')?.value).toBe('CONSULTA');
    expect(form.get('internamento')?.value).toBeTrue();
    expect(form.get('dataHoraAdmissao')?.value).toBe(agora);
    expect(form.valid).toBeFalse();

    form.patchValue({
      petId: 1,
      veterinarioId: 2,
      motivoInternacao: 'Monitoramento completo no pós-operatório',
    });

    expect(form.valid).toBeTrue();
  });

  it('should create evolucao form and validate required fields', () => {
    const form = createEvolucaoForm(fb, agora);

    expect(form.get('dataHora')?.value).toBe(agora);
    expect(form.valid).toBeFalse();

    form.patchValue({
      veterinarioId: 2,
      descricao: 'Paciente estável e aceitando alimentação normalmente',
    });

    expect(form.valid).toBeTrue();
  });

  it('should create status form requiring novoStatus', () => {
    const form = createStatusForm(fb);

    expect(form.valid).toBeFalse();
    form.patchValue({ novoStatus: 'EM_TRATAMENTO' });
    expect(form.valid).toBeTrue();
  });

  it('should create alta form with required fields', () => {
    const form = createAltaForm(fb, agora);

    expect(form.get('dataHoraAlta')?.value).toBe(agora);
    expect(form.valid).toBeFalse();

    form.patchValue({
      condicaoAlta: 'Estável',
      resumoAlta: 'Paciente respondeu bem à terapia instituída.',
      orientacoesTutor: 'Manter repouso e retorno em 7 dias.',
    });

    expect(form.valid).toBeTrue();
  });
});
