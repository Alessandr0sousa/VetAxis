import { AgendamentosModel } from "./agendamentos-model";
import { ConsultaModel } from "./consulta-model";
import { CirurgiaModel } from "./cirurgia-model";
import { ExameModel } from "./exame-model";
import { VacinaModel } from "./vacina-model";

/**
 * Modelo unificado para todos os tipos de agendamentos
 * Combina campos base (AgendamentosModel) com campos específicos de cada tipo
 * Uso: Consulta, Cirurgia, Exame ou Vacina dependendo do tipoAgendamento
 */
export interface ConsultasFormAgendamentosModel
	extends AgendamentosModel,
		Omit<ConsultaModel, 'status'>,
		CirurgiaModel,
		ExameModel,
		Omit<VacinaModel, 'nome'> {  // Omit 'nome' para evitar conflito com AgendamentosModel.nome

	// Status unificado como string para todos os tipos
	status?: string;
}
