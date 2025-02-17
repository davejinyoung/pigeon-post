import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { UnreadEmailsComponent } from './unread-emails/unread-emails.component';
import { EmailSummariesComponent } from './email-summaries/email-summaries.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'emails', component: UnreadEmailsComponent },
    { path: 'summaries', component: EmailSummariesComponent }
  ];
