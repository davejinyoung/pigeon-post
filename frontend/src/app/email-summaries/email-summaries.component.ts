import { Component, OnInit } from '@angular/core';
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

  constructor(private emailService: EmailService, public dateService: DateService) {}

  ngOnInit(): void {
    this.fetchEmailSummaries();
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
}

interface EmailSummariesResponse {
  emails_with_summaries: any[];
}
