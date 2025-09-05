import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AreaPrivada } from './area-privada';

describe('AreaPrivada', () => {
  let component: AreaPrivada;
  let fixture: ComponentFixture<AreaPrivada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AreaPrivada]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AreaPrivada);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
