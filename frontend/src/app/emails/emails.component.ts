import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { EmailService } from '../services/email.service';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'emails',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './emails.component.html',
  styleUrls: ['./emails.component.css']
})
export class EmailsComponent implements OnInit {
  emails: any[] = [];
  selectedEmailIds: { [key: string]: boolean } = {};

  constructor(private emailService: EmailService, private router: Router) {}

  ngOnInit(): void {
    this.fetchEmails();
  }

  fetchEmails(): void {
    this.emailService.getEmails().subscribe(
      (data) => {
        this.emails = data;
      },
      (error) => {
        console.error('Error fetching emails:', error);
      }
    );
  }

  async sendEmailIds() {
    try {
      const selectedIds = Object.keys(this.selectedEmailIds).filter(emailId => this.selectedEmailIds[emailId]);
      this.emailService.setSelectedEmailIds(selectedIds);
      if (selectedIds.length === 0) {
        console.error('No email IDs selected');
        return;
      }
      this.router.navigate(['/summaries']);
    } catch (error) {
      console.error('Error sending email IDs:', error);
    }
  }
}
