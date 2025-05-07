import { Component, OnInit, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailService } from '../services/email.service';
import { DateService } from '../services/date.service';
import { Router } from '@angular/router';


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
  isWaiting = false;
  isSavedPage = false;

  constructor(private emailService: EmailService, public dateService: DateService, private elRef: ElementRef, private router: Router) {}

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
    this.isWaiting = true;
    if (this.router.url === '/summaries/saved') {
      this.isSavedPage = true;
      this.emailService.getSavedEmailSummaries().subscribe(
        (data) => {
          this.emails_with_summaries = data.summaries;
          this.hasSummaryError = false;
          this.isWaiting = false;
        },
        (error) => {
          console.error('Error fetching saved email summaries:', error);
          this.hasSummaryError = true;
          this.isWaiting = false;
        }
      );
      return;
    } else if (this.router.url === '/summaries') {
      this.isSavedPage = false;
      this.emailService.getEmailSummaries().subscribe(
        (data: EmailSummariesResponse) => {
          this.emails_with_summaries = data.emails_with_summaries ? data.emails_with_summaries : [];
          this.hasSummaryError = false;
          this.isWaiting = false;
        },
        (error) => {
          console.error('Error fetching summaries:', error);
          this.hasSummaryError = true;
          this.isWaiting = false;
        }
      );
      return;
    }
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
    const email = this.emails_with_summaries.find(e => e.id === emailId);

    if (!email) {
      console.error(`Email with ID ${emailId} not found.`);
      return;
    }

    const payload = {
      summary: {
        id: email.id,
        sender: email.sender,
        subject: email.subject,
        snippet: email.snippet,
        body: email.body,
        summary: email.summary,
        internal_date: email.internal_date,
        thread_id: email.thread_id,
      }
    };

    this.emailService.saveEmailSummary(payload).subscribe(
      (response) => {
        console.log('Email summary saved successfully:', response);
      },
      (error) => {
        console.error('Error saving email summary:', error);
      }
    );
  }

  unsaveEmailSummary(emailId: string): void {
    const email = this.emails_with_summaries.find(e => e.id === emailId);

    if (!email) {
      console.error(`Email with ID ${emailId} not found.`);
      return;
    }

    const payload = {
      summary: {
        id: email.id,
        sender: email.sender,
        subject: email.subject,
        snippet: email.snippet,
        body: email.body,
        summary: email.summary,
        internal_date: email.internal_date,
        thread_id: email.thread_id,
      }
    };

    this.emailService.unsaveEmailSummary(payload).subscribe(
      (response) => {
        console.log('Email summary unsaved successfully:', response);
      },
      (error) => {
        console.error('Error unsaving email summary:', error);
      }
    );
  }

  regenerateEmailSummary(emailId: string): void {
    console.log(`Regenerating summary for email ID: ${emailId}`);
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
