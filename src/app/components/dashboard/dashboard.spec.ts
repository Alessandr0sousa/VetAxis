import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { Dashboard } from './dashboard';
import { ClientesService } from '@features/clientes';
import { PetService } from '@features/pets';
import { InternacaoService } from '@features/internacoes';
import { AgendamentosService } from '@features/agendamentos';
import { EscalaVeterinariosService, VeterinarioService } from '@features/veterinarios';
import { AlertService } from '@shared/services';

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;

  const clientesServiceMock = {
    listar: () =>
      of({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 1,
        number: 0,
        first: true,
        last: true,
      }),
  };

  const petServiceMock = {
    listar: () =>
      of({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 1,
        number: 0,
        first: true,
        last: true,
      }),
  };

  const internacaoServiceMock = {
    listar: () =>
      of({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 20,
        number: 0,
        first: true,
        last: true,
      }),
  };

  const agendamentosServiceMock = {
    buscarPorCampo: () =>
      of({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 200,
        number: 0,
        first: true,
        last: true,
      }),
  };

  const veterinarioServiceMock = {
    listar: () =>
      of({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 200,
        number: 0,
        first: true,
        last: true,
      }),
  };

  const escalaServiceMock = {
    buscar: () => of({ content: [] }),
  };

  const alertServiceMock = {
    error: jasmine.createSpy('error'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: ClientesService, useValue: clientesServiceMock },
        { provide: PetService, useValue: petServiceMock },
        { provide: InternacaoService, useValue: internacaoServiceMock },
        { provide: AgendamentosService, useValue: agendamentosServiceMock },
        { provide: VeterinarioService, useValue: veterinarioServiceMock },
        { provide: EscalaVeterinariosService, useValue: escalaServiceMock },
        { provide: AlertService, useValue: alertServiceMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
