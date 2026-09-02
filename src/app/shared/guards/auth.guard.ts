import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toster: ToastrService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      return true;

    // if (this.authService.isLoggedIn())
    //   return true;
    // else {
    //   // this.toster.warning('Morate se ponovo ulogovati.', 'Globos osiguranje');
    //   this.authService.signOut();
    //   // this.router.navigate(['login']);
    //   return false;
    // }
  }
}
