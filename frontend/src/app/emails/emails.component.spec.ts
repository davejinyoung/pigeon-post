import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailsComponent } from './emails.component';

describe('UnreadEmailsComponent', () => {
  let component: EmailsComponent;
  let fixture: ComponentFixture<EmailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
