import {
  Component,
  OnInit,
  ElementRef,
  HostListener,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { EmailService } from '../services/email.service';
import { DateService } from '../services/date.service';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@angular/cdk/dialog';

@Component({
  selector: 'emails',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './emails.component.html',
  styleUrls: ['./emails.component.scss'],
})
export class EmailsComponent implements OnInit {
  emails: any[] = [];
  emailsPage: any[] = [];
  selectedEmailIds: { [key: string]: boolean } = {};
  isDateRangeMenuHidden = true;
  isInboxTypeMenuHidden = true;
  isWaiting = false;
  todayDate: string = '';
  customStartDate: string = '';
  customEndDate: string = this.todayDate;
  customStartDateError: string | null = null;
  customEndDateError: string | null = null;
  numberOfPages: number = 1;
  currentPage: number = 1;
  emailsPerPage: number = 10;
  emailFilters: emailFilters = new emailFilters();
  dateRangeLabel: string = 'Last 24 Hours';
  inboxTypeLabel: string = 'All Mail';
  inboxType?: string;

  constructor(
    private emailService: EmailService,
    public dateService: DateService,
    private authService: AuthService,
    private router: Router,
    private elRef: ElementRef,
    private dialog: Dialog
  ) {
    this.todayDate = this.dateService.formatDate(new Date());
    this.customEndDate = this.todayDate;
    this.customStartDate = this.todayDate;
    this.emailFilters.dateRange = 1;
    this.customEndDate = this.todayDate;
    this.customStartDate = this.todayDate;
  }

  ngOnInit(): void {
    this.authService.checkLoginStatus();
    this.todayDate = this.dateService.formatDate(new Date());
    this.fetchEmails();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      !this.elRef.nativeElement
        .querySelector('#date-range-menu-button')
        ?.contains(event.target)
    ) {
      this.isDateRangeMenuHidden = true;
    }
    if (
      !this.elRef.nativeElement
        .querySelector('#inbox-type-menu-button')
        ?.contains(event.target) &&
      !this.elRef.nativeElement
        .querySelector('#inbox-type-menu')
        ?.contains(event.target)
    ) {
      this.isInboxTypeMenuHidden = true;
    }
  }

  fetchEmails(dateRange?: number): void {
    this.isWaiting = true;
    this.currentPage = 1;
    this.emailService.getEmails(dateRange, this.inboxType).subscribe(
      (data) => {
        this.emails = data;
        this.initializeEmails();
      },
      (error) => {
        this.isWaiting = false;
      }
    );
  }

  initializeEmails(): void {
    // Check if there are any emails
    this.emailService.getSelectedEmails().forEach((email) => {
      const selectedEmail = this.emails.find((e) => e.id === email.id);
      if (selectedEmail) {
        this.selectedEmailIds[selectedEmail.id] = true;
      }
    });

    this.numberOfPages = Math.ceil(this.emails.length / this.emailsPerPage);

    // For every page, slice the emails array to get the emails for that page
    this.emailsPage = [];
    for (let i = 0; i < this.numberOfPages; i++) {
      this.emailsPage.push(
        this.emails.slice(i * this.emailsPerPage, (i + 1) * this.emailsPerPage)
      );
    }

    this.isWaiting = false;
  }

  async sendEmailIds() {
    try {
      if (this.updateSelectedEmailIds().length === 0) {
        console.error('No email IDs selected');
        return;
      }
      this.router.navigate(['/summaries']);
    } catch (error) {
      console.error('Error sending email IDs:', error);
    }
  }

  trashSelectedEmails(): void {
    const ids = this.updateSelectedEmailIds();

    if (ids.length === 0) {
      console.error('No email IDs selected');
      return;
    }

    this.emails = this.emails.filter((email) => !ids.includes(email.id));
    this.initializeEmails();

    this.emailService.trashEmails(ids).subscribe(
      (response) => {
        this.updateSelectedEmailIds();
      },
      (error) => {
        console.error('Error deleting emails:', error);
        this.isWaiting = false;
      }
    );
  }

  selectAllEmails(): void {
    this.emails.forEach((email) => {
      this.selectedEmailIds[email.id] = true;
    });
    this.updateSelectedEmailIds();
  }

  deselectAllEmails(): void {
    this.emails.forEach((email) => {
      this.selectedEmailIds[email.id] = false;
    });
    this.updateSelectedEmailIds();
  }

  updateSelectedEmailIds(): string[] {
    const selectedIds = Object.keys(this.selectedEmailIds).filter(
      (emailId) => this.selectedEmailIds[emailId]
    );
    const selectedEmails = this.emails.filter((email) =>
      selectedIds.includes(email.id)
    );
    this.emailService.setSelectedEmails(selectedEmails);

    return selectedIds;
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
    this.customEndDate = this.dateService.formatDate(new Date());
    this.updateDateRangeLabel();
  }

  updateDateRangeLabel(): void {
    if (this.customEndDate == this.dateService.formatDate(new Date())) {
      this.dateRangeLabel =
        this.emailFilters.dateRange != 1
          ? 'Last ' + this.emailFilters.dateRange + ' Days'
          : 'Last 24 Hours';
    } else {
      this.dateRangeLabel = this.customStartDate + ' - ' + this.customEndDate;
    }
  }

  openCustomDateModal(templateRef: TemplateRef<any>): void {
    this.dialog.open(templateRef, {
      autoFocus: false,
    });
  }

  closeCustomDateModal() {
    this.dialog.closeAll();
    this.customStartDateError = null;
    this.customEndDateError = null;
  }

  setCustomDateRangeFilter() {
    if (this.customStartDate == '' || this.customEndDate == '') {
      this.customStartDateError = 'Please enter a start date';
    }
    if (this.customEndDate == '') {
      this.customEndDateError = 'Please enter an end date';
    }
    if (this.customStartDate == '' || this.customEndDate == '') {
      return;
    }
    const startDate = new Date(this.customStartDate);
    const endDate = new Date(this.customEndDate);

    this.emailFilters.dateRange =
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);

    this.updateDateRangeLabel();
    this.closeCustomDateModal();
  }

  handleEndDateChange(value: string) {
    if (value) {
      this.todayDate = this.customEndDate;
    } else {
      this.todayDate = this.dateService.formatDate(new Date());
    }
  }

  setSelectInboxTypeFilters(filter?: string): void {
    if (filter == undefined) {
      this.inboxType = undefined;
      this.inboxTypeLabel = 'All Mail';
    } else {
      this.inboxType = filter;
      this.inboxTypeLabel = '';
      if (filter.substring(0, 8) == 'category') {
        this.inboxTypeLabel =
          filter.substring(9).charAt(0).toUpperCase() +
          filter.substring(9).slice(1);
      } else {
        this.inboxTypeLabel = filter.charAt(0).toUpperCase() + filter.slice(1);
      }
    }

    this.toggleInboxTypeMenu();
  }

  navigatePage(page: number): void {
    console.log(page);
    if (page >= 1 && page <= this.numberOfPages) {
      this.currentPage = page;
      window.scrollTo(0, 0);
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
