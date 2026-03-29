import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExamesFormAgendamentos } from './exames-form-agendamentos';

describe('ExamesFormAgendamentos', () => {
  let component: ExamesFormAgendamentos;
  let fixture: ComponentFixture<ExamesFormAgendamentos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamesFormAgendamentos],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamesFormAgendamentos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
