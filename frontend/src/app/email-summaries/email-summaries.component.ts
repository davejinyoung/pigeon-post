import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailService } from '../services/email.service';


@Component({
  selector: 'app-email-summaries',
  imports: [CommonModule],
  templateUrl: './email-summaries.component.html',
  styleUrl: './email-summaries.component.scss'
})

export class EmailSummariesComponent implements OnInit {
  summaries: string[] = [];
  hasSummaryError = false;

  constructor(private emailService: EmailService) {}

  ngOnInit(): void {
    this.fetchEmailSummaries();
  }

  fetchEmailSummaries(): void {
    this.emailService.getEmailSummaries().subscribe(
      (data: EmailSummariesResponse) => {
        this.summaries = data.summaries;
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
  summaries: string[];
}
