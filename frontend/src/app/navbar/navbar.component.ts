import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isProfileMenuHidden = true;

  toggleProfileMenu() {
    this.isProfileMenuHidden = !this.isProfileMenuHidden;
  }
}