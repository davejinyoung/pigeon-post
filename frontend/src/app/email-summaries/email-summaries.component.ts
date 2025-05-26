import { Component, OnInit, ElementRef, HostListener, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailService } from '../services/email.service';
import { DateService } from '../services/date.service';
import { Router } from '@angular/router';
import { Dialog } from '@angular/cdk/dialog';


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
  isRegenerating = false;

  constructor(private emailService: EmailService, public dateService: DateService, private elRef: ElementRef, private router: Router, private dialog: Dialog) {}

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
    const fetchFn = this.router.url === '/summaries/saved'
      ? this.emailService.getSavedEmailSummaries()
      : this.emailService.getEmailSummaries();

    fetchFn.subscribe(
      (data: any) => {
        this.emails_with_summaries = data.summaries || data.emails_with_summaries || [];
        this.hasSummaryError = false;
        this.isWaiting = false;
        this.isSavedPage = this.router.url === '/summaries/saved';
      },
      () => {
        this.hasSummaryError = true;
        this.isWaiting = false;
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
    const email = this.emails_with_summaries.find(e => e.id === emailId);
    this.toggleEmailOptionsDropdown(emailId);

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
        document.getElementById("successAlert")?.classList.remove('hidden');  
      },
      (error) => {
        console.error('Error saving email summary:', error);
      }
    );
  }

  hideSuccessAlert(): void {
    document.getElementById("successAlert")?.classList.add('hidden'); 
  }

  unsaveEmailSummary(emailId: string): void {
    const email = this.emails_with_summaries.find(e => e.id === emailId);
    this.toggleEmailOptionsDropdown(emailId);

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
        this.emails_with_summaries = this.emails_with_summaries.filter(e => e.id !== emailId);
      },
      (error) => {
        console.error('Error unsaving email summary:', error);
      }
    );
  }

  regenerateEmailSummary(emailId: string, summaryFeedback: string): void {
    const index = this.emails_with_summaries.findIndex(e => e.id === emailId);
    const email = this.emails_with_summaries[index];
    this.toggleEmailOptionsDropdown(emailId);
    this.emails_with_summaries[index]['isRegenerating'] = true;
    this.emailService.postEmailSummaryRequest([email], false, summaryFeedback).subscribe(
      (data) => {
        this.emails_with_summaries[index].summary = data.emails_with_summaries[0].summary;
        this.emails_with_summaries[index]['isRegenerating'] = false;
      })
    this.closeModal();
  }

  removeEmailSummary(emailId: string): void {
    document.getElementById(`email-${emailId}`)?.remove();
    this.emails_with_summaries = this.emails_with_summaries.filter(email => email.id !== emailId);
    this.emailService.setSelectedEmails(this.emails_with_summaries);
  }

  openModal(templateRef: TemplateRef<any>): void {
    this.dialog.open(templateRef);
  }

  closeModal(): void {
    this.dialog.closeAll();
  }
}

interface EmailSummariesResponse {
  emails_with_summaries: any[];
}
