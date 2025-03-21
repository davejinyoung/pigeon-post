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
  isWaiting = false;
  isCustomDateModalOpen = false;
  todayDate: string = this.formatDate(new Date());
  customStartDate: string = "";
  customEndDate: string = this.todayDate;
  customStartDateError: string | null = null;
  customEndDateError: string | null = null;
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
  dateRangeLabel: string = "Last 24 Hours";
  inboxTypeLabel: string[] = ["Inbox"]

  constructor(private emailService: EmailService, private router: Router, private elRef: ElementRef) {}

  ngOnInit(): void {
    this.fetchEmails();
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
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

  fetchEmails(dateRange?: number): void {
    this.isWaiting = true;
    this.emailService.getEmails(dateRange, this.selectedInboxTypes).subscribe(
      (data) => {
        this.emails = data;
        this.isWaiting = false;
      },
      (error) => {
        console.error('Error fetching emails:', error);
        this.isWaiting = false;
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

  selectAllEmails(): void {
    this.emails.forEach((email) => {
      this.selectedEmailIds[email.id] = true;
    });
  }

  deselectAllEmails(): void {
    this.emails.forEach((email) => {
      this.selectedEmailIds[email.id] = false;
    });
  }

  toggleDateRangeMenu(): void {
    this.isDateRangeMenuHidden = !this.isDateRangeMenuHidden;
  }

  toggleInboxTypeMenu(): void {
    this.isInboxTypeMenuHidden = !this.isInboxTypeMenuHidden;
  }

  setAutoDateRangeFilter(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.emailFilters.dateRange = Number(target.value);
    this.customEndDate = this.formatDate(new Date());
    this.updateDateRangeLabel();
  }

  updateDateRangeLabel(): void {
    if (this.customEndDate == this.formatDate(new Date())) {
      this.dateRangeLabel = (this.emailFilters.dateRange != 1) ? 
        "Last " + this.emailFilters.dateRange + " Days" : 
        "Last 24 Hours";
    } else {
      this.dateRangeLabel = this.customStartDate + " - " + this.customEndDate;
    }
  }

  openCustomDateModal() {
    this.isCustomDateModalOpen = true;
  }

  closeCustomDateModal() {
    this.isCustomDateModalOpen = false;
    this.customStartDateError = null;
    this.customEndDateError = null;
  }

  setCustomDateRangeFilter() {
    if (this.customStartDate == "" || this.customEndDate == "") {
      this.customStartDateError = "Please enter a start date";
    }
    if (this.customEndDate == "") {
      console.log("Please enter an end date");
      this.customEndDateError = "Please enter an end date";
    }
    if (this.customStartDate == "" || this.customEndDate == "") {
      return;
    }
    const startDate = new Date(this.customStartDate);
    const endDate = new Date(this.customEndDate);

    this.emailFilters.dateRange = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    this.updateDateRangeLabel();
    this.closeCustomDateModal();
  }

  setAllInboxTypeFilters(event: Event): void {
    const allFiltersCheckbox = event.target as HTMLInputElement;
    if (allFiltersCheckbox.checked) {
      (Object.keys(this.selectedInboxTypes) as Array<keyof typeof this.selectedInboxTypes>).forEach((key) => {
        this.selectedInboxTypes[key] = true;
        this.inboxTypeLabel = [];
        this.inboxTypeLabel.push("All");
      });
    }
    else {
      (Object.keys(this.selectedInboxTypes) as Array<keyof typeof this.selectedInboxTypes>).forEach((key) => {
        this.selectedInboxTypes[key] = false;
        this.inboxTypeLabel = [];
        this.inboxTypeLabel.push("None");
      });
    }
  }

  handleEndDateChange(value: string) {
    if (value) {
      this.todayDate = this.customEndDate;
    } else {
      this.todayDate = this.formatDate(new Date());
    }
  }

  setSelectInboxTypeFilters(): void {
    this.inboxTypeLabel = [];
    (Object.keys(this.selectedInboxTypes) as Array<keyof typeof this.selectedInboxTypes>).forEach((key) => {
      if (this.selectedInboxTypes[key]) {
        if (key.substring(0, 8) == "category") {
          this.inboxTypeLabel.push(key.substring(9).charAt(0).toUpperCase() + key.substring(9).slice(1));
        } else {
          this.inboxTypeLabel.push(key.charAt(0).toUpperCase() + key.slice(1));
        }
      }
    });
    if (this.inboxTypeLabel.length == 0) {
      this.inboxTypeLabel.push("None");
    }
  }

  applyFilters(): void {
    this.emails = [];
    this.fetchEmails(this.emailFilters.dateRange);
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
