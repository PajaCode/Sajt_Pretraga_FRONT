import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CurrentUserService } from '../services/current-user.service';

// Jedinstveno rukovanje HTTP greskama za sve API pozive - ne dira poslovni
// success/false response format (RequestResult/ApiResponse), samo transportne greske.
@Injectable()
export class ApiErrorInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private currentUserService: CurrentUserService,
    private router: Router,
    private toster: ToastrService,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        switch (error.status) {
          case 401:
            this.authService.deleteAllTokens();
            this.currentUserService.clear();
            if (!this.router.url.startsWith('/login')) {
              this.toster.error('Sesija je istekla. Ulogujte se ponovo.', 'Globos osiguranje');
              this.router.navigate(['/login']);
            }
            break;
          case 403:
            this.toster.error('Nemate dozvolu za ovu akciju.', 'Globos osiguranje');
            break;
          case 400:
            this.toster.error(error.error?.message || 'Neispravan zahtev.', 'Globos osiguranje');
            break;
          case 0:
            this.toster.error('Server nije dostupan.', 'Globos osiguranje');
            break;
          default:
            this.toster.error(error.error?.message || 'Doslo je do greske. Pokusajte ponovo.', 'Globos osiguranje');
        }

        return throwError(() => error);
      })
    );
  }
}
