import { TestBed } from '@angular/core/testing';

import { ApiSevice } from './api-sevice';

describe('ApiSevice', () => {
  let service: ApiSevice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApiSevice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
