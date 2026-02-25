import { AgendamentosModel } from "./agendamentos-model";
import { ConsultaModel } from "./consulta-model";
import { CirurgiaModel } from "./cirurgia-model";
import { ExameModel } from "./exame-model";
import { VacinaModel } from "./vacina-model";

export interface ConsultasFormAgendamentosModel
	extends AgendamentosModel,
		ConsultaModel,
		CirurgiaModel,
		ExameModel,
		VacinaModel {
}
