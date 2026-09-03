import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { CurrentUserService } from '../services/current-user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private currentUserService: CurrentUserService,
    private router: Router,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {

    // ensureLoaded ceka na /api/Master/me inicijalizaciju pre nego sto guard odluci -
    // na refresh-u state jos nije popunjen iz konstruktora.
    return this.currentUserService.ensureLoaded().pipe(
      map(user => {
        if (user && this.authService.isLoggedIn()) {
          return true;
        }

        // Bez ovoga cache moze ostati da drzi stari (istekao) user objekat, sto bi
        // naveo GuestGuard da pogresno vrati korisnika sa /login nazad u portal.
        this.authService.deleteAllTokens();
        this.currentUserService.clear();
        return this.router.createUrlTree(['/login']);
      })
    );
  }
}
