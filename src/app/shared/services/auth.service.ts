import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/environment';
import { LoginUser } from '../models/login-user';
import { RegisterUser } from '../models/register-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private baseApiAuth: string = environment.baseApiUrl + 'Auth/';


  constructor(
    private http: HttpClient,
    private router: Router,
    private jwtHelper: JwtHelperService
  ) { }

  login(user: any): Observable<LoginUser> {
    this.deleteToken('email-token');
    const headers = { 'content-type': 'application/json' }
    return this.http.post<LoginUser>(this.baseApiAuth + 'Login', user, { 'headers': headers });
  }

  register(user: any): Observable<RegisterUser[]> {
    this.deleteToken('email-token');
    const headers = { 'content-type': 'application/json' }
    return this.http.post<RegisterUser[]>(this.baseApiAuth + 'Register', user, { 'headers': headers });
  }

  updateUser(user): Observable<any> {
    const headers = { 'content-type': 'application/json' }
    return this.http.post(this.baseApiAuth + 'UpdateUser', user, { 'headers': headers });
  }

  resetPassword(resetPasswordModel): Observable<any> {
    const headers = { 'content-type': 'application/json' }
    return this.http.post(this.baseApiAuth + 'ResetPassword', resetPasswordModel, { 'headers': headers });
  }

  resetForgottenPassword(resetPasswordModel): Observable<any> {
    const headers = { 'content-type': 'application/json' }
    return this.http.post(this.baseApiAuth + 'ResetForgottenPassword', resetPasswordModel, { 'headers': headers });
  }

  getUser() {
    if (!this.isLoggedIn())
      return;

    const decodedUser = this.jwtHelper.decodeToken(this.getToken('user-token'));
    return decodedUser;
  }

  setToken(key: string, value: string) {
    this.deleteToken(key);
    localStorage.setItem(key, value);
  }

  getToken(key: string): string {
    return localStorage.getItem(key)
  }

  deleteToken(key: string) {
    localStorage.removeItem(key);
  }

  deleteAllTokens() {
    localStorage.clear()
  }

  isLoggedIn(): boolean {
    const token: string = this.getToken('user-token');

    if (!token)
      return false;

    try {
      const decodedToken = this.jwtHelper.decodeToken(token);

      if (!decodedToken || this.jwtHelper.isTokenExpired(token))
        return false;

      return true;
    } catch (error) {
      return false;
    }
  }

  isResetTokenValid(url: string): boolean {
    if (!url)
      return false;

    try {
      const decodedToken = this.jwtHelper.decodeToken(url);

      if (!decodedToken || this.jwtHelper.isTokenExpired(url))
        return false;

      return true;
    } catch (error) {
      return false;
    }
  }

  signOut(url?: string) {
    console.clear();
    this.deleteAllTokens();
    // Apsolutna putanja - relativni navigate (bez '/') iz rute koja nije root
    // pokusava da otvori podputanju trenutne rute i tiho ne uspeva.
    this.router.navigate([url ? url : '/login']);
  }
}
