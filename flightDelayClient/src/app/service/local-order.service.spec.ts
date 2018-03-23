import { TestBed, inject } from '@angular/core/testing';

import { LocalOrderService } from './local-order.service';

describe('LocalOrderService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalOrderService]
    });
  });

  it('should be created', inject([LocalOrderService], (service: LocalOrderService) => {
    expect(service).toBeTruthy();
  }));
});
