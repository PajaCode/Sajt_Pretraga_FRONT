import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  private baseApiEmail = environment.baseApiUrl + 'Email/';

  constructor(private http: HttpClient) { }

  sendEmail(emailUlaz: any): Observable<any> {
    const headers = { 'content-type': 'application/json' }
    return this.http.post(this.baseApiEmail + 'SendEmail', emailUlaz, { 'headers': headers });
  }

  SendEmailRefund(formData): Observable<any> {
    return this.http.post(this.baseApiEmail + 'SendEmailRefund', formData);
  }
}
