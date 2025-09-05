import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoDeVacunacion } from './estado-de-vacunacion';

describe('EstadoDeVacunacion', () => {
  let component: EstadoDeVacunacion;
  let fixture: ComponentFixture<EstadoDeVacunacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoDeVacunacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoDeVacunacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
