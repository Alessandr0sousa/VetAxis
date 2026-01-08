import { Pessoa } from './pessoa';

export interface VeterinarioModel extends Pessoa {
  crmv: string;
  especialidade: String;
  status: boolean;
}

// especialidade-veterinaria.enum.ts
export enum EspecialidadeVeterinaria {
  ANESTESIOLOGIA           = 'Anestesiologia Veterinária',
  ANIMAIS_AQUATICOS        = 'Medicina de Animais Aquáticos',
  ANIMAIS_LABORATORIO      = 'Medicina de Animais de Laboratório',
  ANIMAIS_SILVESTRES       = 'Medicina de Animais Silvestres e Exóticos',
  CARDIOLOGIA              = 'Cardiologia Veterinária',
  CIRURGIA                 = 'Cirurgia Veterinária',
  CLINICA_GRANDES_ANIMAIS  = 'Clínica Médica de Grandes Animais',
  CLINICA_PEQUENOS_ANIMAIS = 'Clínica Médica de Pequenos Animais',
  DERMATOLOGIA             = 'Dermatologia Veterinária',
  DIAGNOSTICO_IMAGEM       = 'Diagnóstico por Imagem',
  INSPECAO_PRODUTOS        = 'Inspeção e Tecnologia de Produtos de Origem Animal',
  MEDICINA_FELINA          = 'Medicina Felina',
  MEDICINA_PREVENTIVA      = 'Medicina Veterinária Preventiva',
  NEUROLOGIA               = 'Neurologia Veterinária',
  NUTRICAO                 = 'Nutrição Animal',
  OFTALMOLOGIA             = 'Oftalmologia Veterinária',
  ONCOLOGIA                = 'Oncologia Veterinária',
  ORTOPEDIA                = 'Ortopedia Veterinária',
  PATOLOGIA                = 'Patologia Veterinária',
  REPRODUCAO               = 'Reprodução Animal',
  ZOOTECNIA                = 'Zootecnia e Produção Animal'
}
