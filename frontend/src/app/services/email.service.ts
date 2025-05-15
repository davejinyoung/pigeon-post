import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrlRoot = 'http://127.0.0.1:8000/api/';

  private selectedEmailsSubject = new BehaviorSubject<string[]>([]); 
  selectedEmails$ = this.selectedEmailsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getEmails(dateRange?: number, inboxTypes?: string): Observable<any[]> {
    let labels: string[] = [];
    if (inboxTypes) {
      labels.push(inboxTypes.toLocaleUpperCase());
    }

    if (dateRange && typeof localStorage !== 'undefined') {
      localStorage.setItem('emailFilters', JSON.stringify(dateRange));
    }

    if (typeof localStorage === 'undefined') {
      return this.http.get<any[]>(this.apiUrlRoot + 'emails/');
    };
    
    let emailFilters: emailFilters = {
      dateRange: JSON.parse(localStorage.getItem('emailFilters') || '0'),
      labels: labels,
      query: '',
      maxResults: 30
    }

    return this.http.post<any[]>(this.apiUrlRoot + 'emails/', {"filters": emailFilters});
  }

  postEmailFilters(filters: any): Observable<any> {
    return this.http.post<any>(this.apiUrlRoot + 'emails/', filters);
  }

  getEmailSummaries(): Observable<any> {
    const emails = this.getSelectedEmails();
    if (emails.length === 0) {
      return of([]);
    }
    return this.postEmailSummaryRequest(emails);
  }

  postEmailSummaryRequest(emails: any[], isCache=true): Observable<any> {
    return this.http.post<any>(this.apiUrlRoot + 'emails/summaries/', {"emails": emails, "cache": isCache});
  }

  saveEmailSummary(emailSummary: any): Observable<any> {
    return this.http.post<any>(this.apiUrlRoot + 'emails/summaries/saved/', {"summary": emailSummary});
  }

  unsaveEmailSummary(emailSummary: any): Observable<any> {
    return this.http.post<any>(this.apiUrlRoot + 'emails/summaries/saved/', {"summary": emailSummary, "save": false});
  }

  getSavedEmailSummaries(): Observable<any> {
    return this.http.get<any>(this.apiUrlRoot + 'emails/summaries/saved/');
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