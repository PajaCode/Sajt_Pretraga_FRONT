import { Component, HostListener } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  headerAllow: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.url;
        const page = url.includes('confirm-mail') || url.includes('login') || url.includes('register') || url.includes('reset-password');

        this.headerAllow = !page && this.isLoggedIn();
      }
    });
  }

  ngOnInit(): void {
  }


  // provera da li je korisnik ulogovan
  isLoggedIn() {
    return this.authService.isLoggedIn();
  }
}
