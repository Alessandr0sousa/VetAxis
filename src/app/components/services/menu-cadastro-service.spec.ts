import { TestBed } from '@angular/core/testing';

import { MenuCadastroService } from './menu-cadastro-service';

describe('MenuCadastroService', () => {
  let service: MenuCadastroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MenuCadastroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
