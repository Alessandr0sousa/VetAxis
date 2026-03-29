import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardCompany } from './card-cliente';

describe('CardCliente', () => {
  let component: CardCompany;
  let fixture: ComponentFixture<CardCompany>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardCompany]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardCompany);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
