import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeterinariosForm } from './veterinarios-form';

describe('VeterinariosForm', () => {
  let component: VeterinariosForm;
  let fixture: ComponentFixture<VeterinariosForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeterinariosForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VeterinariosForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
