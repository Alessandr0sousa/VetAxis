import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuncionariosForm } from './funcionarios-form';

describe('FuncionariosForm', () => {
  let component: FuncionariosForm;
  let fixture: ComponentFixture<FuncionariosForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FuncionariosForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FuncionariosForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
