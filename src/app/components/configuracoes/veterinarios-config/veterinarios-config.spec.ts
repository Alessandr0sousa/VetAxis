import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeterinariosConfig } from './veterinarios-config';

describe('VeterinariosConfig', () => {
  let component: VeterinariosConfig;
  let fixture: ComponentFixture<VeterinariosConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeterinariosConfig],
    }).compileComponents();

    fixture = TestBed.createComponent(VeterinariosConfig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
