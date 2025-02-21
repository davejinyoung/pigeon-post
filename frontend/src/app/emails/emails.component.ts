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
  isInboxTypeMenuHidden = true;
  selectedInboxTypes = {
    unread: false,
    read: false,
    last7days: false
  };
  emailFilters: emailFilters = new emailFilters();
  dateRangeLabel: string = 'All Time'

  constructor(private emailService: EmailService, private router: Router, private elRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.fetchEmails();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elRef.nativeElement.querySelector("#date-range-menu-button")?.contains(event.target)) {
      this.isDateRangeMenuHidden = true;
    }
    if (!this.elRef.nativeElement.querySelector("#inbox-type-menu-button")?.contains(event.target)) {
      this.isInboxTypeMenuHidden = true;
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

  toggleInboxTypeMenu(): void {
    console.log("inbox menu toggle")
    this.isInboxTypeMenuHidden = !this.isInboxTypeMenuHidden;
  }

  setDateRangeFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.emailFilters.dateRange = Number(target.value);
    this.dateRangeLabel = dateRangeLabelsDist[this.emailFilters.dateRange];
  }

  setInboxTypeFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.emailFilters.labels = target.value.split(',');
    this.dateRangeLabel = dateRangeLabelsDist[this.emailFilters.dateRange];
  }

  applyFilters(): void {
    this.emailService.getEmails(this.emailFilters.dateRange).subscribe(
      (data) => {
        this.emails = data;
      },
      (error) => {
        console.error('Error fetching emails:', error);
      }
    );
    this.emails = []
  }
}

class emailFilters {
  dateRange: number;
  labels: string[];
  query: string;
  maxResults: number;

  constructor() {
    this.dateRange = 0;
    this.labels = [];
    this.query = '';
    this.maxResults = 10;
  }
}

const dateRangeLabelsDist: { [key: number]: string } = {
  0: 'All Time',
  1: 'Last 24 Hours',
  3: 'Last 3 Days',
  7: 'Last 7 Days',
  30: 'Last 30 Days'
};
