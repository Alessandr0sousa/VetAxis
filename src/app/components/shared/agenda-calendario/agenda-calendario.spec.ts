import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaCalendario } from './agenda-calendario';

describe('AgendaCalendario', () => {
  let component: AgendaCalendario;
  let fixture: ComponentFixture<AgendaCalendario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaCalendario]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendaCalendario);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
