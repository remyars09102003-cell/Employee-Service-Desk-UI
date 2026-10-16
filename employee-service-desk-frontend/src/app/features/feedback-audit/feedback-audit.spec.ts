import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeedbackAudit } from './feedback-audit';

describe('FeedbackAudit', () => {
  let component: FeedbackAudit;
  let fixture: ComponentFixture<FeedbackAudit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackAudit],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackAudit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
