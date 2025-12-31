import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCliente } from './card-cliente';

describe('CardCliente', () => {
  let component: CardCliente;
  let fixture: ComponentFixture<CardCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardCliente]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardCliente);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
