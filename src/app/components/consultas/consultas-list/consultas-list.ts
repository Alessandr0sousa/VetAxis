import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  STATUS_BADGE_CLASS,
  STATUS_FONT_CLASS,
  STATUS_ICON_CLASS,
  StatusAgendamentoLabels,
} from '../../models/consulta-model';
import { ConsultasFormAgendamentosModel } from '../../models/consultas-form-agendametos-model';
import { AgendamentosService } from '../../services/agendamentos-service';

@Component({
  selector: 'app-consultas-list',
  templateUrl: './consultas-list.html',
  styleUrls: ['./consultas-list.scss'],
})
export class ConsultasList implements OnInit, OnChanges {
  @Input() diaSelected: string = ''; // recebido do pai

  agendamentoList: ConsultasFormAgendamentosModel[] = [];
  agendamentosFiltrados: ConsultasFormAgendamentosModel[] = [];

  iconesStatus = STATUS_ICON_CLASS;
  fonteColorStatus = STATUS_FONT_CLASS;
  labelStatus = StatusAgendamentoLabels;
  badgeStatus = STATUS_BADGE_CLASS;

  constructor(
    private agendamentoService: AgendamentosService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.agendamentoService.agendamentos$.subscribe((lista) => {
      this.agendamentoList = lista;
      this.filtrarAgendamentos();
      this.cdr.detectChanges();
    });

    this.listarAgendamentos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['diaSelected']) {
      this.listarAgendamentos();
      this.filtrarAgendamentos();
      this.cdr.detectChanges();
    }
  }

  listarAgendamentos() {
    this.agendamentoService
      .buscarPorCampo({
        campo: 'dia',
        valor: this.diaSelected,
        page: 0,
        size: 20,
        sort: [
          { field: 'dia', direction: 'asc' },
          { field: 'horario', direction: 'asc' },
        ],
      })
      .subscribe({
        error: (error) => {
          console.error('Erro ao listar agendamentos:', error);
        },
      });
  }

  private filtrarAgendamentos(): void {
    if (this.diaSelected) {
      this.agendamentosFiltrados = this.agendamentoList.filter((a) => a.dia === this.diaSelected);
    } else {
      this.agendamentosFiltrados = this.agendamentoList;
    }
  }
}
