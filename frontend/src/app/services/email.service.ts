import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrlRoot = 'http://localhost:8000/api/';

  private selectedEmailsSubject = new BehaviorSubject<string[]>([]);
  selectedEmails$ = this.selectedEmailsSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getCsrfTokenHeader(): HttpHeaders  {
    if (isPlatformBrowser(this.platformId)) {
      const name = 'csrftoken=';
      const decodedCookie = decodeURIComponent(document.cookie);
      const cookies = decodedCookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.indexOf(name) === 0) {
          return new HttpHeaders({
            'X-CSRFToken': cookie.substring(name.length, cookie.length) || '',
          });
        }
      }
    }
    return new HttpHeaders();
  }

  getEmails(dateRange?: number, inboxTypes?: string): Observable<any[]> {
    let labels: string[] = [];
    if (inboxTypes) {
      labels.push(inboxTypes.toLocaleUpperCase());
    }

    if (dateRange && typeof localStorage !== 'undefined') {
      localStorage.setItem('emailFilters', JSON.stringify(dateRange));
    }

    if (typeof localStorage === 'undefined') {
      return this.http.get<any[]>(
        this.apiUrlRoot + 'emails/', 
        { headers: this.getCsrfTokenHeader(), withCredentials: true }
      );
    };

    let emailFilters: emailFilters = {
      dateRange: JSON.parse(localStorage.getItem('emailFilters') || '0'),
      labels: labels,
      query: '',
      maxResults: 30
    }

    return this.http.post<any[]>(
      this.apiUrlRoot + 'emails/', {"filters": emailFilters}, 
      { headers: this.getCsrfTokenHeader(), withCredentials: true }
    );
  }

  trashEmails(emails: any[]): Observable<any> {
    if (emails.length === 0) {
      return of({ success: true });
    }
    localStorage.removeItem('selectedEmails');
    return this.http.post<any>(
      this.apiUrlRoot + 'emails/trash/', {"email_ids": emails}, 
      { headers: this.getCsrfTokenHeader(), withCredentials: true }
    );
  }

  postEmailFilters(filters: any): Observable<any> {
    return this.http.post<any>(
      this.apiUrlRoot + 'emails/', filters
    );
  }

  getEmailSummaries(): Observable<any> {
    const emails = this.getSelectedEmails();
    return this.postEmailSummaryRequest(emails);
  }

  getSavedEmailSummaries(): Observable<any> {
    return this.http.get<any>(
      this.apiUrlRoot + 'emails/summaries/saved/', 
      { headers: this.getCsrfTokenHeader(), withCredentials: true }
    );
  }

  postEmailSummaryRequest(emails: any[], isCache=true, summaryFeedback=""): Observable<any> {
    return this.http.post<any>(
      this.apiUrlRoot + 'emails/summaries/', 
      {"emails": emails, "cache": isCache, "summary_input": summaryFeedback}, 
      { headers: this.getCsrfTokenHeader(), withCredentials: true }
    );
  }

  saveEmailSummary(emailSummary: any): Observable<any> {
    return this.http.post<any>(
      this.apiUrlRoot + 'emails/summaries/saved/', 
      {"summary": emailSummary}
    );
  }

  unsaveEmailSummary(emailSummary: any): Observable<any> {
    return this.http.post<any>(
      this.apiUrlRoot + 'emails/summaries/saved/', 
      {"summary": emailSummary, "save": false}
    );
  }

  setSelectedEmails(emails: any[]) {
    this.selectedEmailsSubject.next(emails);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('selectedEmails', JSON.stringify(emails));
    }
  }

  getSelectedEmails(): any[] {
    if (typeof localStorage === 'undefined') return [];

    const storedEmails = localStorage.getItem('selectedEmails');
    return storedEmails ? JSON.parse(storedEmails) : [];
  }
}

interface emailFilters {
  dateRange: number;
  labels: string[];
  query: string;
  maxResults: number;
}
