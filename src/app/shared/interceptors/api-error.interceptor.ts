import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { from, Observable, switchMap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CurrentUserService } from '../services/current-user.service';

// Kod (npr. download endpoint-a) responseType je 'blob', pa Angular error.error
// takodje parsira kao Blob umesto JSON-a - moramo ga rucno procitati da bismo
// dosli do stvarne API poruke, ne samo do default fallback-a.
async function extractApiErrorMessage(error: HttpErrorResponse): Promise<string | null> {
  if (error.error instanceof Blob) {
    try {
      const text = await error.error.text();
      return JSON.parse(text)?.message ?? null;
    } catch {
      return null;
    }
  }

  return error.error?.message ?? null;
}

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
      catchError((error: HttpErrorResponse) => from(extractApiErrorMessage(error)).pipe(
        switchMap(apiMessage => {
          switch (error.status) {
            case 401:
              this.authService.deleteAllTokens();
              this.currentUserService.clear();
              if (!this.router.url.startsWith('/login')) {
                this.toster.error(apiMessage || 'Sesija je istekla. Ulogujte se ponovo.', 'Globos osiguranje');
                this.router.navigate(['/login']);
              }
              break;
            case 403:
              this.toster.error(apiMessage || 'Nemate dozvolu za ovu akciju.', 'Globos osiguranje');
              break;
            case 400:
              this.toster.error(apiMessage || 'Neispravan zahtev.', 'Globos osiguranje');
              break;
            case 0:
              this.toster.error('Server nije dostupan.', 'Globos osiguranje');
              break;
            default:
              this.toster.error(apiMessage || 'Doslo je do greske. Pokusajte ponovo.', 'Globos osiguranje');
          }

          return throwError(() => error);
        })
      ))
    );
  }
}
