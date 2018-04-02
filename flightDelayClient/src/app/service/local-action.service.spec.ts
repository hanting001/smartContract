import { TestBed, inject } from '@angular/core/testing';

import { LocalActionService } from './local-action.service';

describe('LocalActionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LocalActionService]
    });
  });

  it('should be created', inject([LocalActionService], (service: LocalActionService) => {
    expect(service).toBeTruthy();
  }));
});
