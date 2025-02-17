import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnreadEmailsComponent } from './unread-emails.component';

describe('UnreadEmailsComponent', () => {
  let component: UnreadEmailsComponent;
  let fixture: ComponentFixture<UnreadEmailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnreadEmailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnreadEmailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
