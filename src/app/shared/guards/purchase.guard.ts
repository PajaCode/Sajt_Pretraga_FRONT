import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../services/current-user.service';

// Stiti '/kupovina-paketa': dozvoljen samo korisniku bez aktivnog paketa. Koristi se
// zajedno sa AuthGuard (taj vec obezbedjuje da je korisnik uopste ulogovan).
@Injectable({ providedIn: 'root' })
export class PurchaseGuard implements CanActivate {
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

        if (user.hasActivePackage) {
          // Nema podrzan renewal flow - aktivan korisnik nema potrebe da ponovo
          // prolazi kroz kupovinu.
          return this.router.createUrlTree(this.currentUserService.landingRoute(user));
        }

        return true;
      })
    );
  }
}
