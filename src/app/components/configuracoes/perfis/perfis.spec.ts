import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Perfis } from './perfis';

describe('Perfis', () => {
  let component: Perfis;
  let fixture: ComponentFixture<Perfis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Perfis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Perfis);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
