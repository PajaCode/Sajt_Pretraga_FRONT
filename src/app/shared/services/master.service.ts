import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/enviroments/environment';
import { ApiResponse } from '../models/api-response';
import { CurrentUser } from '../models/current-user';
import { BookAppointmentRequest, BookAppointmentResult, ConfirmEmailRequest, ConfirmEmailResult, CoveredService, DocumentListItem, ForgotPasswordRequest, InstitutionForService, MyAppointment, PackageDetails, PackageListItem, PaymentConfirmMockRequest, PaymentConfirmResult, PaymentInitiateResult, PurchaseCompleteRequest, PurchaseCompleteResult, RegisterRequest, RegisterResult, ResendActivationEmailRequest, ResendActivationEmailResult, ResetPasswordRequest, SyncDocumentationItem, UpdateProfileRequest, ValidateResetTokenRequest } from '../models/master';

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

  getPackageDetails(id: number): Observable<ApiResponse<PackageDetails>> {
    return this.http.get<ApiResponse<PackageDetails>>(this.baseApiMaster + 'packages/' + id);
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

  forgotPassword(request: ForgotPasswordRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(this.baseApiMaster + 'forgot-password', request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(this.baseApiMaster + 'reset-password', request);
  }

  validateResetToken(request: ValidateResetTokenRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(this.baseApiMaster + 'validate-reset-token', request);
  }

  updateProfile(request: UpdateProfileRequest): Observable<ApiResponse<object>> {
    return this.http.post<ApiResponse<object>>(this.baseApiMaster + 'update-profile', request);
  }

  getMyCoveredServices(): Observable<ApiResponse<CoveredService[]>> {
    return this.http.get<ApiResponse<CoveredService[]>>(this.baseApiMaster + 'my-covered-services');
  }

  getInstitutionsForService(medUslugaId: number): Observable<ApiResponse<InstitutionForService[]>> {
    return this.http.get<ApiResponse<InstitutionForService[]>>(this.baseApiMaster + 'institutions-for-service/' + medUslugaId);
  }

  bookAppointment(request: BookAppointmentRequest): Observable<ApiResponse<BookAppointmentResult>> {
    return this.http.post<ApiResponse<BookAppointmentResult>>(this.baseApiMaster + 'book-appointment', request);
  }

  getMyAppointments(): Observable<ApiResponse<MyAppointment[]>> {
    return this.http.get<ApiResponse<MyAppointment[]>>(this.baseApiMaster + 'my-appointments');
  }

  syncDocumentation(): Observable<ApiResponse<SyncDocumentationItem[]>> {
    return this.http.post<ApiResponse<SyncDocumentationItem[]>>(this.baseApiMaster + 'sync-documentation', {});
  }

  getAppointmentDocuments(pregledStatusId: number): Observable<ApiResponse<DocumentListItem[]>> {
    return this.http.get<ApiResponse<DocumentListItem[]>>(this.baseApiMaster + 'pregledi/' + pregledStatusId + '/documents');
  }

  downloadDocument(documentId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(this.baseApiMaster + 'documents/' + documentId + '/download', {
      observe: 'response',
      responseType: 'blob',
    });
  }
}
