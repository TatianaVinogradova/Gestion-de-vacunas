import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Registracion } from './registracion';

describe('Registracion', () => {
  let component: Registracion;
  let fixture: ComponentFixture<Registracion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Registracion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Registracion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
