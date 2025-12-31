import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Internacao } from './internacao';

describe('Internacao', () => {
  let component: Internacao;
  let fixture: ComponentFixture<Internacao>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Internacao]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Internacao);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
