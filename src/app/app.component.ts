import { Component, OnInit } from '@angular/core';
import { DzoService } from './shared/services/dzo.service';
import { PrimeNGConfig } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { NavigationEnd, Router } from '@angular/router';
import { CurrentUserService } from './shared/services/current-user.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'sajt-pretraga-front';

  formaZaLeadove: boolean = true;

  constructor(private config: PrimeNGConfig,
              private router: Router,
              private currentUserService: CurrentUserService) { }

  ngOnInit(): void {

    // Ucitava current-user state jednom na bootstrap/refresh, da header i guard-ovi
    // ne cekaju svaki svoju kopiju poziva ka /me.
    this.currentUserService.ensureLoaded().subscribe();

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.formaZaLeadove = !this.router.url.includes('/formaZaLeadove');
      }
    });

    this.config.setTranslation({
      startsWith: 'Počinje sa',
      contains: 'Sadrži',
      notContains: 'Ne sadrži',
      endsWith: 'Završava sa',
      equals: 'Jednak je',
      notEquals: 'Nije jednak',
      noFilter: 'Bez filtera',
    });

    this.config.ripple = true;
  }
}
