import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarioDeVacunas } from './calendario-de-vacunas';

describe('CalendarioDeVacunas', () => {
  let component: CalendarioDeVacunas;
  let fixture: ComponentFixture<CalendarioDeVacunas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalendarioDeVacunas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarioDeVacunas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
