import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from '../services/current-user.service';

// Stiti rute koje zahtevaju aktivan paket (MR_UserAccountState.AccountStatus === 'ActivePackage').
// Pretpostavlja da je AuthGuard vec prosao (koristi se zajedno, ne umesto njega).
@Injectable({
  providedIn: 'root'
})
export class ActivePackageGuard implements CanActivate {
  constructor(
    private currentUserService: CurrentUserService,
    private router: Router,
    private toster: ToastrService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {

    return this.currentUserService.ensureLoaded().pipe(
      map(user => {
        if (user && user.hasActivePackage) {
          return true;
        }

        if (!user) {
          return this.router.createUrlTree(['/login']);
        }

        this.toster.warning('Potrebno je da prvo kupite paket.', 'Globos osiguranje');
        return this.router.createUrlTree(['/paketi']);
      })
    );
  }
}
