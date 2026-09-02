import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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

    return this.fetch();
  }

  refresh(): Observable<CurrentUser | null> {
    return this.fetch();
  }

  clear(): void {
    this.state$.next(null);
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
