import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaForm } from './consulta-form';

describe('ConsultaForm', () => {
  let component: ConsultaForm;
  let fixture: ComponentFixture<ConsultaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
