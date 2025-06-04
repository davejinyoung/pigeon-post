import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { EmailsComponent } from './emails/emails.component';
import { EmailSummariesComponent } from './email-summaries/email-summaries.component';
import { SettingsComponent } from './settings/settings.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: 'emails', component: EmailsComponent, title: 'Emails' },
    { path: 'login', component: LoginComponent, title: 'Login' },
    { path: 'summaries', component: EmailSummariesComponent, title: 'Email Summaries' },
    { path: 'summaries/saved', component: EmailSummariesComponent, title: 'Saved Email Summaries' },
    { path: 'settings', component: SettingsComponent, title: 'Settings' },
    { path: '**', redirectTo: 'emails' }
  ];
