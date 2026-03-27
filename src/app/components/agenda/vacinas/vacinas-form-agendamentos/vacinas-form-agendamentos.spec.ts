import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VacinasFormAgendamentos } from './vacinas-form-agendamentos';

describe('VacinasFormAgendamentos', () => {
  let component: VacinasFormAgendamentos;
  let fixture: ComponentFixture<VacinasFormAgendamentos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacinasFormAgendamentos],
    }).compileComponents();

    fixture = TestBed.createComponent(VacinasFormAgendamentos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
