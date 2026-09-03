import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CurrentUserService } from '../services/current-user.service';

// Stiti '/login' od vec ulogovanog korisnika sa validnom sesijom - salje ga na
// njegovu landing rutu umesto da mu ponovo prikaze formu za login.
@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(
    private currentUserService: CurrentUserService,
    private router: Router,
  ) { }

  canActivate(): Observable<boolean | UrlTree> {
    return this.currentUserService.ensureLoaded().pipe(
      map(user => {
        if (!user || this.currentUserService.isBlocked(user)) {
          // Blocked nema poseban ekran (status se ne generise u backend-u) - zadrzi
          // ga na login ekranu (poruku vec prikazuje guard koji ga je ovde poslao)
          // umesto da ga vrati u krug ka landing ruti.
          return true;
        }

        return this.router.createUrlTree(this.currentUserService.landingRoute(user));
      })
    );
  }
}
