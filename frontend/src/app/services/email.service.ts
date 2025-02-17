import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrlRoot = 'http://127.0.0.1:8000/api/';  // Replace with your actual API

  constructor(private http: HttpClient) {}

  getUnreadEmails(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrlRoot + 'unread-emails/');
  }

  getUnreadEmailsSummaries(): Observable<EmailSummariesResponse> {
    return this.http.get<EmailSummariesResponse>(this.apiUrlRoot + 'unread-emails-summaries/');
  }
}

interface EmailSummariesResponse {
  summaries: string[];
}