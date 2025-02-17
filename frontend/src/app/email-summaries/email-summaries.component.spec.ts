import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailSummariesComponent } from './email-summaries.component';

describe('EmailSummariesComponent', () => {
  let component: EmailSummariesComponent;
  let fixture: ComponentFixture<EmailSummariesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailSummariesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailSummariesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
