import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EmailsComponent } from './emails/emails.component';
import { EmailSummariesComponent } from './email-summaries/email-summaries.component';

export const routes: Routes = [
    { path: 'emails', component: EmailsComponent, title: 'Emails' },
    { path: 'summaries', component: EmailSummariesComponent, title: 'Email Summaries' },
    { path: 'summaries/saved', component: EmailSummariesComponent, title: 'Saved Email Summaries' },
    { path: '', component: HomeComponent, title: 'Home' }
  ];
