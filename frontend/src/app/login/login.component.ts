import { Component } from '@angular/core';

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  connectGmail() {
    window.location.href = '/api/auth/gmail/init/';
  }
}
