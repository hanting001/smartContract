import { TestBed, inject } from '@angular/core/testing';

import { FlightDelayService } from './flight-delay.service';

describe('FlightDelayService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FlightDelayService]
    });
  });

  it('should be created', inject([FlightDelayService], (service: FlightDelayService) => {
    expect(service).toBeTruthy();
  }));
});
