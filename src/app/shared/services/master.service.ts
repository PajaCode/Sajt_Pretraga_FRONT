import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/environment';
import { ApiResponse } from '../models/api-response';
import { CurrentUser } from '../models/current-user';
import { ConfirmEmailRequest, ConfirmEmailResult, PackageListItem, PaymentConfirmMockRequest, PaymentConfirmResult, PaymentInitiateResult, PurchaseCompleteRequest, PurchaseCompleteResult, RegisterRequest, RegisterResult, ResendActivationEmailRequest, ResendActivationEmailResult } from '../models/master';

@Injectable({
  providedIn: 'root'
})
export class MasterService {

  private baseApiMaster: string = environment.baseApiUrl + 'Master/';

  constructor(private http: HttpClient) { }

  register(request: RegisterRequest): Observable<ApiResponse<RegisterResult>> {
    return this.http.post<ApiResponse<RegisterResult>>(this.baseApiMaster + 'register', request);
  }

  confirmEmail(request: ConfirmEmailRequest): Observable<ApiResponse<ConfirmEmailResult>> {
    return this.http.post<ApiResponse<ConfirmEmailResult>>(this.baseApiMaster + 'confirm-email', request);
  }

  resendActivationEmail(request: ResendActivationEmailRequest): Observable<ApiResponse<ResendActivationEmailResult>> {
    return this.http.post<ApiResponse<ResendActivationEmailResult>>(this.baseApiMaster + 'resend-activation-email', request);
  }

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
