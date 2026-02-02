import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultasList } from './consultas-list';

describe('ConsultasList', () => {
  let component: ConsultasList;
  let fixture: ComponentFixture<ConsultasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultasList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
