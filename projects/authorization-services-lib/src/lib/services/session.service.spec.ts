import { TestBed } from '@angular/core/testing';

import { SessionServiceTsService } from './session.service.ts.service';

describe('SessionServiceTsService', () => {
  let service: SessionServiceTsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionServiceTsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
