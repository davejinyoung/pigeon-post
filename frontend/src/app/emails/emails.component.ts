import { Component, OnInit, ElementRef, Renderer2, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { EmailService } from '../services/email.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'emails',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './emails.component.html',
  styleUrls: ['./emails.component.css']
})
export class EmailsComponent implements OnInit {
  emails: any[] = [];
  selectedEmailIds: { [key: string]: boolean } = {};
  isDateRangeMenuHidden = true;

  constructor(private emailService: EmailService, private router: Router, private elRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.fetchEmails();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elRef.nativeElement.querySelector("#menu-button").contains(event.target)) {
      this.isDateRangeMenuHidden = true;
    }
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

  toggleDateRangeMenu(): void {
    this.isDateRangeMenuHidden = !this.isDateRangeMenuHidden;
  }

  setDateRangeFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    const dateRange = Number(target.value);
    this.emailService.getEmails(dateRange).subscribe(
      (data) => {
        this.emails = data;
      },
      (error) => {
        console.error('Error fetching emails:', error);
      }
    );
    this.isDateRangeMenuHidden = true;
    // this.emailService.postEmailFilters({ dateRange }).subscribe(
    //   () => {
    //     this.fetchEmails();
    //   },
    //   (error) => {
    //     console.error('Error setting date range filter:', error);
    //   }
    // );
  }
}
