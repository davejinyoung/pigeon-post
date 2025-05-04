import { Component, OnInit, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailService } from '../services/email.service';
import { DateService } from '../services/date.service';


@Component({
  selector: 'app-email-summaries',
  imports: [CommonModule],
  templateUrl: './email-summaries.component.html',
  styleUrl: './email-summaries.component.scss'
})

export class EmailSummariesComponent implements OnInit {
  emails_with_summaries: any[] = [];
  hasSummaryError = false;
  isEmailOptionsDropdownHidden = true;

  constructor(private emailService: EmailService, public dateService: DateService, private elRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.fetchEmailSummaries();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    this.emails_with_summaries.forEach(email => {
      const dropdown = this.elRef.nativeElement.querySelector(`#email-options-dropdown-${email.id}`);
      const ellipsis = this.elRef.nativeElement.querySelector(`#ellipsis-${email.id}`);
      if (dropdown && !dropdown.contains(event.target) && !ellipsis.contains(event.target)) {
        dropdown.classList.add('hidden');
      }
    });
  }

  fetchEmailSummaries(): void {
    this.emailService.getEmailSummaries().subscribe(
      (data: EmailSummariesResponse) => {
        this.emails_with_summaries = data.emails_with_summaries;
        this.hasSummaryError = false;
      },
      (error) => {
        console.error('Error fetching summaries:', error);
        this.hasSummaryError = true;
      }
    );
  }

  toggleEmailOptionsDropdown(emailId: string): void {
    const dropdown = document.getElementById(`email-options-dropdown-${emailId}`);
    if (dropdown?.classList.contains('hidden')) {
      dropdown.classList.remove('hidden');
    } else {
      dropdown?.classList.add('hidden');
    }
  }

  saveEmailSummary(emailId: string): void {
    console.log(`Saving summary for email ID: ${emailId}`);
    // Implement the logic to save the email summary here
  }

  regenerateEmailSummary(emailId: string): void {
    console.log(`Regenerating summary for email ID: ${emailId}`);
    // Implement the logic to regenerate the email summary here
  }

  removeEmailSummary(emailId: string): void {
    document.getElementById(`email-${emailId}`)?.remove();
    this.emails_with_summaries = this.emails_with_summaries.filter(email => email.id !== emailId);
    this.emailService.setSelectedEmails(this.emails_with_summaries);
  }
}

interface EmailSummariesResponse {
  emails_with_summaries: any[];
}
