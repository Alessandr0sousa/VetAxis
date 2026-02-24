import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnexosUpload } from './anexos-upload';

describe('AnexosUpload', () => {
  let component: AnexosUpload;
  let fixture: ComponentFixture<AnexosUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnexosUpload]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnexosUpload);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
