import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CirurgiasFormAgendamentos } from './cirurgias-form-agendamentos';

describe('CirurgiasFormAgendamentos', () => {
  let component: CirurgiasFormAgendamentos;
  let fixture: ComponentFixture<CirurgiasFormAgendamentos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CirurgiasFormAgendamentos],
    }).compileComponents();

    fixture = TestBed.createComponent(CirurgiasFormAgendamentos);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
