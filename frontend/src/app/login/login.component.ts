import { Component } from '@angular/core';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  connectGmail() {
    window.location.href = 'http://localhost:8000/api/auth/gmail/init/';
  }
}
