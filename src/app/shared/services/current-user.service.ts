import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';
import { CurrentUser } from '../models/current-user';
import { AuthService } from './auth.service';
import { MasterService } from './master.service';

// undefined = jos nije ucitano (initial), null = ucitano ali korisnik nije ulogovan
type CurrentUserState = CurrentUser | null | undefined;

@Injectable({
  providedIn: 'root'
})
export class CurrentUserService {

  private state$ = new BehaviorSubject<CurrentUserState>(undefined);

  readonly user$: Observable<CurrentUserState> = this.state$.asObservable();

  // FIX J - AppComponent.ngOnInit() i prvi route guard oba pozivaju ensureLoaded()
  // u istom tick-u na bootstrap/refresh (state$ je oboma jos undefined), sto je bez
  // ovoga slalo 2 paralelna GET /Master/me poziva za isto ucitavanje. Deljenje istog
  // in-flight Observable-a svodi to na jedan HTTP poziv.
  private pending$: Observable<CurrentUser | null> | null = null;

  constructor(
    private masterService: MasterService,
    private authService: AuthService,
  ) { }

  get snapshot(): CurrentUserState {
    return this.state$.value;
  }

  // Guard-ovi ovo pozivaju da sacekaju inicijalizaciju na refresh-u umesto da
  // citaju cache koji jos nije postavljen.
  ensureLoaded(): Observable<CurrentUser | null> {
    if (this.state$.value !== undefined) {
      return of(this.state$.value);
    }

    if (this.pending$) {
      return this.pending$;
    }

    this.pending$ = this.fetch().pipe(
      finalize(() => this.pending$ = null),
      shareReplay(1),
    );

    return this.pending$;
  }

  refresh(): Observable<CurrentUser | null> {
    return this.fetch();
  }

  clear(): void {
    this.state$.next(null);
  }

  // AccountStatus 'Blocked' se trenutno ne generise nigde u backend-u (provereno
  // kroz sve migracije), ali guard-ovi/login flow ga moraju prepoznati ako se ikad pojavi -
  // ne sme se tretirati kao obican "nema paket" korisnik.
  isBlocked(user: CurrentUser | null): boolean {
    return !!user && user.accountStatus === 'Blocked';
  }

  // Centralna odluka gde ulogovan (ne-blokiran) korisnik treba da sleti posle
  // login-a / na '/' / kad rucno otvori '/login'. Package-protected guard-ovi i dalje
  // koriste hasActivePackage direktno, ovo je samo za landing/redirect odluku.
  landingRoute(user: CurrentUser): string[] {
    // '/paketi' ("Informacije o ugovorenom pokricu") je stvarni pocetni ekran za
    // ActivePackage korisnika u produkciji - '/home' ostaje samo legacy ruta.
    return user.hasActivePackage ? ['/paketi'] : ['/kupovina-paketa'];
  }

  private fetch(): Observable<CurrentUser | null> {
    if (!this.authService.isLoggedIn()) {
      this.state$.next(null);
      return of(null);
    }

    return this.masterService.getMe().pipe(
      map(res => res.data),
      tap(user => this.state$.next(user)),
      catchError(() => {
        this.state$.next(null);
        return of(null);
      })
    );
  }
}
