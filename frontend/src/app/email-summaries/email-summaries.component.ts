import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmailService } from '../services/email.service';


@Component({
  selector: 'app-email-summaries',
  imports: [CommonModule],
  templateUrl: './email-summaries.component.html',
  styleUrl: './email-summaries.component.scss'
})

export class EmailSummariesComponent implements OnInit {
  summaries: string[] = [];  // Use the 'string[]' type for summaries
  emailIds: string[] = [];

  constructor(private emailService: EmailService) {}

  ngOnInit(): void {
    this.emailIds = this.emailService.getSelectedEmailIds();
    this.fetchEmailSummaries();
  }

  fetchEmailSummaries(): void {
    if (this.emailIds.length === 0) return;
    this.emailService.getEmailSummaries(this.emailIds).subscribe(
      (data: EmailSummariesResponse) => {
        this.summaries = data.summaries;
      },
      (error) => {
        console.error('Error fetching summaries:', error);
      }
    );
  }
}

interface EmailSummariesResponse {
  summaries: string[];
}
