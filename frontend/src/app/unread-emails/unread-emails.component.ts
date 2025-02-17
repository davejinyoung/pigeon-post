import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmailService } from '../services/email.service';

@Component({
  selector: 'unread-emails',
  imports: [CommonModule, RouterModule],
  templateUrl: './unread-emails.component.html',
  styleUrls: ['./unread-emails.component.css']
})
export class UnreadEmailsComponent implements OnInit {
  emails: any[] = [];

  constructor(private emailService: EmailService) {}

  ngOnInit(): void {
    this.fetchEmails();
  }

  fetchEmails(): void {
    this.emailService.getUnreadEmails().subscribe(
      (data) => {
        this.emails = data;
      },
      (error) => {
        console.error('Error fetching emails:', error);
      }
    );
  }
}