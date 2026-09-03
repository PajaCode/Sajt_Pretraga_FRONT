import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../services/current-user.service';

// Session-aware routing za '/' - nema statickog redirectTo, odluka zavisi od
// stvarnog /api/Master/me stanja (CurrentUserService), ne samo od prisustva JWT-a.
@Injectable({ providedIn: 'root' })
export class RootGuard implements CanActivate {
  constructor(
    private currentUserService: CurrentUserService,
    private router: Router,
    private toster: ToastrService,
  ) { }

  canActivate(): Observable<boolean | UrlTree> {
    return this.currentUserService.ensureLoaded().pipe(
      map(user => {
        if (!user) {
          return this.router.createUrlTree(['/login']);
        }

        if (this.currentUserService.isBlocked(user)) {
          this.toster.error('Nalog je blokiran. Kontaktirajte podršku.', 'Globos osiguranje');
          return this.router.createUrlTree(['/login']);
        }

        return this.router.createUrlTree(this.currentUserService.landingRoute(user));
      })
    );
  }
}
