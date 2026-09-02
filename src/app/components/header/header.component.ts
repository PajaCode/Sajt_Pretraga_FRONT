import { animate, state, style, transition, trigger } from '@angular/animations';
import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CurrentUserService } from '../../shared/services/current-user.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [
    trigger('dropdownAnimation', [
      state('closed', style({
        display: 'none',
        opacity: 0,
      })),
      state('open', style({
        display: 'block',
        opacity: 1,
      })),
      transition('closed => open', animate('0.3s ease-in-out')),
      transition('open => closed', animate('0.3s ease-in-out'))
    ]),
  ]
})
export class HeaderComponent implements OnInit {

  isDropdownOpen: boolean = false;

  username: any;

  url: string;
  headerAllow: boolean = false;
  pokaziHeader: boolean = false;

  mainLinks: any[] = []
  optionLinks: any[] = []
  displayNavbarNavButton: boolean = true; // Default to true

  @ViewChild('navbarNavButton') navbarNavButton: ElementRef;

  hasActivePackage: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private currentUserService: CurrentUserService,
  ) {
    this.currentUserService.user$.subscribe(user => {
      this.hasActivePackage = !!user?.hasActivePackage;
      if (this.url) {
        this.handleNavigation();
      }
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.url = event.url;

        this.pokaziHeader = !(
          this.url.includes('/formaZaLeadove') ||
          this.url.includes('/login') ||
          this.url.includes('/dzo') ||
          this.url.includes('/register') ||
          this.url.includes('/confirm-mail') ||
          this.url.includes('/reset-password')

        );

        this.handleNavigation();

      }
    });
  }

  ngOnInit(): void {

  }

  handleNavigation() {
    const page = this.url.includes('confirm-mail') || this.url.includes('login') || this.url.includes('register') || this.url.includes('reset-password');

    if (this.isLoggedIn() && !page) {
      this.mainLinks = this.hasActivePackage ? [
        //{ name: 'Početna', url: '/home' },
        //{ name: 'DZO', url: '/dzo' },
        //{ name: 'Zatražite ponudu', url: '/formaZaLeadove' },
        { name: 'Informacije o ugovorenom pokriću', url: '/paketi' },
        { name: 'Zahtev za zakazivanje pregleda', url: '/kontaktdzo'},
        { name: 'Refundacije', url: '/refundacije'},
      ] : [
        { name: 'Kupovina paketa', url: '/kupovina-paketa' },
      ]

      this.optionLinks = [
        {
          name: 'Opcije', subMenu: [
            { name: 'Profil', url: '/profil' },
            { name: 'Izloguj se', url: '/login' },
          ]
        }
      ]
    }
    else if (!this.isLoggedIn() && page) {
      this.mainLinks = [];
      this.optionLinks = [];
    }
    // else if (!this.isLoggedIn() && this.url === '/dzo') {
    //   this.mainLinks = []
    //   this.optionLinks = [
    //     {
    //       name: 'Opcije', subMenu: [
    //         { name: 'Uloguj se', url: '/login' },
    //         { name: 'Registruj se', url: '/register' },
    //       ]
    //     }
    //   ]
    // }
    else {
      this.mainLinks = [];
      this.optionLinks = [];
    }

    const isOptionLinksNotEmpty = this.optionLinks.length > 0;
    const isWindowWidthLessThan992 = window.innerWidth < 992;
    this.displayNavbarNavButton = (isOptionLinksNotEmpty && isWindowWidthLessThan992) || (!isOptionLinksNotEmpty && !isWindowWidthLessThan992);
  }

  // funkcija za zatvaranje navbar-a na klik na link
  handleLinkClick(urlName?) {
    if (window.innerWidth < 992)
      if (this.navbarNavButton) {
        this.navbarNavButton.nativeElement.click();
      }

    if (urlName === '/login') {
      this.logout();
    }
  }

  // otvaranje i zatvaranje dropdown-a
  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // zatvaranje dropdown-a na klik na link
  closeDropdown() {
    this.isDropdownOpen = false;
  }

  // zatvaranje dropdown-a na klik bilo gde na stranici
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: any) {
    if (!event.target.closest('.nav-link') && !event.target.closest('.dropdown-menu')) {
      this.closeDropdown();
    }
  }

  // provera da li je korisnik ulogovan
  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  // odjavljivanje korisnika
  logout(url?) {
    this.authService.signOut(url);
  }
}
