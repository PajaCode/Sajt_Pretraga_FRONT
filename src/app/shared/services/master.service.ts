import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/environment';
import { ApiResponse } from '../models/api-response';
import { CurrentUser } from '../models/current-user';
import { PackageListItem, PaymentConfirmMockRequest, PaymentConfirmResult, PaymentInitiateResult, PurchaseCompleteRequest, PurchaseCompleteResult } from '../models/master';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  private baseApiMaster: string = environment.baseApiUrl + 'Master/';

  constructor(private http: HttpClient) { }

  getMe(): Observable<ApiResponse<CurrentUser>> {
    return this.http.get<ApiResponse<CurrentUser>>(this.baseApiMaster + 'me');
  }

  getPackages(): Observable<ApiResponse<PackageListItem[]>> {
    return this.http.get<ApiResponse<PackageListItem[]>>(this.baseApiMaster + 'packages');
  }

  initiatePayment(paketId: number): Observable<ApiResponse<PaymentInitiateResult>> {
    return this.http.post<ApiResponse<PaymentInitiateResult>>(this.baseApiMaster + 'payment/initiate', { paketId });
  }

  confirmMockPayment(request: PaymentConfirmMockRequest): Observable<ApiResponse<PaymentConfirmResult>> {
    return this.http.post<ApiResponse<PaymentConfirmResult>>(this.baseApiMaster + 'payment/confirm-mock', request);
  }

  completePurchase(request: PurchaseCompleteRequest): Observable<ApiResponse<PurchaseCompleteResult>> {
    return this.http.post<ApiResponse<PurchaseCompleteResult>>(this.baseApiMaster + 'purchase/complete', request);
  }
}
