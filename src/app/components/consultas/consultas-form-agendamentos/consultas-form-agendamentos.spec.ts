import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasFormAgendamentos } from './consultas-form-agendamentos';

describe('ConsultasFormAgendamentos', () => {
  let component: ConsultasFormAgendamentos;
  let fixture: ComponentFixture<ConsultasFormAgendamentos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultasFormAgendamentos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultasFormAgendamentos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
