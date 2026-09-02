import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseApiDb: string = environment.baseApiUrl + 'Db/';
  private baseApiDzo: string = environment.baseApiUrl + 'DZO/';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getUserDetails(): Observable<any> {
    return this.http.get(this.baseApiDb + 'GetUser' + '/' + this.authService.getUser().Username);
  }

  proveraPolja(parametar, vrednost): Observable<any> {
    const headers = { 'content-type': 'application/json' }
    return this.http.post(this.baseApiDb + 'ProveraPolja' + '?parametar=' + parametar + '&vrednost=' + vrednost, { 'headers': headers });
  }

  istorijaUput(): Observable<any> {
    return this.http.get(this.baseApiDzo + 'DZO_PrikaziZahteve');
  }

  insertUputa(formData): Observable<any> {
    return this.http.post(this.baseApiDzo + 'DZO_InsertOnlineUputa', formData, { responseType: 'text' })
  }

  slanjeFormularaLeadera(formData): Observable<any> {
    return this.http.post(this.baseApiDzo + 'DZO_SlanjeFormularaLeaderima', formData, { responseType: 'text' })
  }


  // uploadFile(file: File, opisProblema, trazenaUstanova, ime, prezime, email) {
  //   const formData: FormData = new FormData();
  //   formData.append('file', file, file.name);
  //   const uploadUrl = this.baseApiDzo + 'UploadFajl?OpisProblema=' + opisProblema + '&TrazenaUstanova=' + trazenaUstanova +
  //               '&Ime=' + ime + '&Prezime=' + prezime + '&Email=' + email;

  //   return this.http.post(uploadUrl, formData);
  // }


}
