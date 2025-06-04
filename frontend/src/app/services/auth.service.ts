import { Injectable } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EmailService } from './email.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private emailService: EmailService,
    private router: Router
  ) {}

  checkLoginStatus(): void {
    this.http.get(
      'http://localhost:8000/api/auth/status/', 
      { headers: this.emailService.getCsrfTokenHeader(), withCredentials: true }
    ).subscribe(
      (response: any) => {
        console.log('Login status:', response);
        if (response.redirect) {
          window.location.href = response.redirect;
        }
      },
      (error) => {
        if (error.status === 403) {
          this.router.navigate(['/login']);
        }
      }
    );
  }
}
