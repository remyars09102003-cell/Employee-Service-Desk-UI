import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Sla } from './sla';

describe('Sla', () => {
  let component: Sla;
  let fixture: ComponentFixture<Sla>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sla],
    }).compileComponents();

    fixture = TestBed.createComponent(Sla);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
