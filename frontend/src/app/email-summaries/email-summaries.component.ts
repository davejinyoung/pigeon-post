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

  constructor(private emailService: EmailService) {}

  ngOnInit(): void {
    this.fetchEmails();
  }

  fetchEmails(): void {
    this.emailService.getUnreadEmailsSummaries().subscribe(
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
