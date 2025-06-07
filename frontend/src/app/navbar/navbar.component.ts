import { Component, ElementRef, HostListener } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  isProfileMenuHidden = true;

  constructor(private elRef: ElementRef, private router: Router) {}

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      !this.elRef.nativeElement
        .querySelector('#profile-menu')
        ?.contains(event.target)
    ) {
      this.isProfileMenuHidden = true;
    }
  }

  toggleProfileMenu() {
    this.isProfileMenuHidden = !this.isProfileMenuHidden;
  }

  logout() {
    window.location.href = 'http://localhost:8000/api/auth/logout/';
  }
}
