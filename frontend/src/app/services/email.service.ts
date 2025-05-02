import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrlRoot = 'http://127.0.0.1:8000/api/';  // Replace with your actual API

  private selectedEmailsSubject = new BehaviorSubject<string[]>([]); 
  selectedEmails$ = this.selectedEmailsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getEmails(dateRange?: number, inboxTypes?: {[key: string]: boolean}): Observable<any[]> {
    let labels: string[] = [];
    if (inboxTypes) {
      Object.keys(inboxTypes).forEach((key) => {
        if (inboxTypes[key] === true) {
          labels.push(key.toLocaleUpperCase());
        }
      });
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
    return this.http.post<any>(this.apiUrlRoot + 'emails/summaries/', {"emails": emails});
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