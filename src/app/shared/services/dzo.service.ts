import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/enviroments/environment';
import { MedUstanova } from '../models/medUstanova';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DzoService {

  baseApiDzo: string = environment.baseApiUrl + 'DZO/';

  JMBG: string;

  constructor(private http: HttpClient, private apiService: ApiService) { }

  getMedUstanove(): Observable<MedUstanova[]> {
    return this.http.get<MedUstanova[]>(this.baseApiDzo + 'DZO_GetMedUstanove');
  }

  getTest(): Observable<any> {
    return this.http.get<any>(this.baseApiDzo + 'Test');
  }

  test(): Observable<any> {
    // const reqHeader = new HttpHeaders();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    // reqHeader.append('Content-Type', 'multipart/form-data');
        // return this.http.post<any>(this.baseApiDzo + 'Test', { headers: reqHeader });
        return this.http.post<any>(this.baseApiDzo + 'Test', null, { headers });
  }

  getMedUstanovePDF(): Observable<Blob> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/pdf' });
    return this.http.get(this.baseApiDzo + 'DZO_ExportMedUstanovePDF', { headers, responseType: 'blob' });
  }

  getOsnovniPodaci(jmbg: string): Observable<any> {
    return this.http.get(this.baseApiDzo + 'DZO_OsnovniPodaci' + '?jmbg=' + jmbg);
  }

  getIskoriscenostPoPaketima(jmbg: string): Observable<any> {
    return this.http.get(this.baseApiDzo + 'DZO_VratiIskoriscenostPoPaketima' + '?jmbg=' + jmbg);
  }

  getIskoriscenostPoPodpokricima(jmbg: string, idPaketa: number): Observable<any> {
    return this.http.get(this.baseApiDzo + 'DZO_VratiIskoriscenostPoPodpokricima' + '?jmbg=' + jmbg + '&idPaketa=' + idPaketa);
  }

  getMedUstanoveGradoviOpstine(): Observable<any> {
    return this.http.get(this.baseApiDzo + 'DZO_MedUstanoveGradoviOpstine');
  }

  getMedUstanoveWithFormat(grad: string, opstina: string): Observable<any> {
    return this.http.get(this.baseApiDzo + 'DZO_PrikaziMedUstanove' + '?grad=' + grad + '&opstina=' + opstina);
  }

}
