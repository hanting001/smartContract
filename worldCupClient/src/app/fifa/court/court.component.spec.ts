import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CourtComponent } from './court.component';

describe('CourtComponent', () => {
  let component: CourtComponent;
  let fixture: ComponentFixture<CourtComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CourtComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CourtComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
