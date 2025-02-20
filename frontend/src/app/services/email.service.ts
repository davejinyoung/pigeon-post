import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrlRoot = 'http://127.0.0.1:8000/api/';  // Replace with your actual API

  private selectedEmailIdsSubject = new BehaviorSubject<string[]>([]); 
  selectedEmailIds$ = this.selectedEmailIdsSubject.asObservable();

  constructor(private http: HttpClient) {}

  getEmails(dateRange?: number): Observable<any[]> {
    if (dateRange && typeof localStorage !== 'undefined') {
      localStorage.setItem('emailFilters', JSON.stringify(dateRange));
    }

    if (typeof localStorage === 'undefined') {
      return this.http.get<any[]>(this.apiUrlRoot + 'emails/');
    };
    
    let emailFilters: emailFilters = {
      dateRange: JSON.parse(localStorage.getItem('emailFilters') || '0'),
      labels: [],
      query: '',
      maxResults: 10
    }

    return this.http.post<any[]>(this.apiUrlRoot + 'emails/', {"filters": emailFilters});
  }

  postEmailFilters(filters: any): Observable<any> {
    return this.http.post<any>(this.apiUrlRoot + 'emails/', filters);
  }

  getEmailSummaries(ids: any): Observable<any> {
    return this.http.post<any>(this.apiUrlRoot + 'emails/summaries/', {"email_ids": ids});
  }

  setSelectedEmailIds(ids: string[]) {
    this.selectedEmailIdsSubject.next(ids);
    
    if (typeof localStorage !== 'undefined') { 
      localStorage.setItem('selectedEmailIds', JSON.stringify(ids));  
    }
  }
  
  getSelectedEmailIds(): string[] {
    if (typeof localStorage === 'undefined') return [];
    
    const storedIds = localStorage.getItem('selectedEmailIds');
    return storedIds ? JSON.parse(storedIds) : [];
  }
}

interface emailFilters {
  dateRange: number;
  labels: string[];
  query: string;
  maxResults: number;
}