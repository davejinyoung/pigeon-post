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
    inbox: true,
    spam: false,
    trash: false,
    unread: false,
    starred: false,
    important: false,
    category_personal: false,
    category_social: false,
    category_promotions: false,
    category_updates: false,
    category_forums: false
  };
  emailFilters: emailFilters = new emailFilters();
  dateRangeLabel: string = 'All Time'

  constructor(private emailService: EmailService, private router: Router, private elRef: ElementRef) {}

  ngOnInit(): void {
    this.fetchEmails();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.elRef.nativeElement.querySelector("#date-range-menu-button")?.contains(event.target)) {
      this.isDateRangeMenuHidden = true;
    }
    if (!this.elRef.nativeElement.querySelector("#inbox-type-menu-button")?.contains(event.target) && !this.elRef.nativeElement.querySelector("#inbox-type-menu")?.contains(event.target)) {
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
    this.isInboxTypeMenuHidden = !this.isInboxTypeMenuHidden;
  }

  setDateRangeFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.emailFilters.dateRange = Number(target.value);
    this.dateRangeLabel = dateRangeLabelsDict[this.emailFilters.dateRange];
  }

  setAllInboxTypeFilters(event: Event): void {
    const allFiltersCheckbox = event.target as HTMLInputElement;
    if (allFiltersCheckbox.checked) {
      (Object.keys(this.selectedInboxTypes) as Array<keyof typeof this.selectedInboxTypes>).forEach((key) => {
        this.selectedInboxTypes[key] = true;
      });
    }
    else {
      (Object.keys(this.selectedInboxTypes) as Array<keyof typeof this.selectedInboxTypes>).forEach((key) => {
        this.selectedInboxTypes[key] = false;
      });
    }
  }

  applyFilters(): void {
    this.emailService.getEmails(this.emailFilters.dateRange, this.selectedInboxTypes).subscribe(
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

const dateRangeLabelsDict: { [key: number]: string } = {
  0: 'All Time',
  1: 'Last 24 Hours',
  3: 'Last 3 Days',
  7: 'Last 7 Days',
  30: 'Last 30 Days'
};
