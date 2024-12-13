import { TestBed } from '@angular/core/testing';

import { WoilaService } from './woila.service';

describe('WoilaService', () => {
  let service: WoilaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WoilaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
