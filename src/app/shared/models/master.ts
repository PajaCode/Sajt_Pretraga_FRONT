// Mora se poklapati sa Saj_Pretraga_API/Models/Master/PackageDtos.cs, PaymentDtos.cs, PurchaseDtos.cs, RegistrationDtos.cs

export interface RegisterRequest {
  ime: string;
  prezime: string;
  email: string;
  username: string;
  password: string;
  jmbg: string;
  brTelefona: string;
}

export interface RegisterResult {
  portalUserId: number;
}

export interface ConfirmEmailRequest {
  activationToken: string;
}

export interface ConfirmEmailResult {
  portalUserId: number;
  confirmed: boolean;
}

export interface ResendActivationEmailRequest {
  email: string;
}

export interface ResendActivationEmailResult {
  portalUserId: number;
}

export interface PackageListItem {
  id: number;
  code: string;
  naziv: string;
  opis: string | null;
  cena: number;
  valuta: string;
  trajanjeDana: number;
  glavnaPokrica: string[];
}

export interface PackageCoveredService {
  medUslugaId: number;
  nazivUsluge: string;
  kategorija: string | null;
}

export interface PackageSubCoverage {
  id: number;
  nazivPodpokrica: string;
  vrstaLimita: string;
  limitVrednost: number | null;
  sumaOsiguranja: number | null;
  usluge: PackageCoveredService[];
}

export interface PackageCoverage {
  id: number;
  nazivPokrice: string;
  sumaOsiguranja: number | null;
  ucesceProcenat: number | null;
  podpokrica: PackageSubCoverage[];
}

export interface PackageDetails {
  id: number;
  code: string;
  naziv: string;
  opis: string | null;
  cena: number;
  valuta: string;
  trajanjeDana: number;
  glavnaPokrica: PackageCoverage[];
}

export interface PaymentInitiateResult {
  internalTransactionId: string;
  amount: number;
  currency: string;
}

export interface PaymentConfirmMockRequest {
  internalTransactionId: string;
  success: boolean;
  failureReason?: string | null;
}

export interface PaymentConfirmResult {
  internalTransactionId: string;
  status: string;
}

export interface PurchaseCompleteRequest {
  internalTransactionId: string;
}

export interface PurchaseCompleteResult {
  brKartice: string;
  brPolise: string;
  paketId: number;
  status: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ValidateResetTokenRequest {
  token: string;
}

export interface UpdateProfileRequest {
  ime: string;
  prezime: string;
  brTelefona: string;
  jmbg?: string | null;
}

// Mora se poklapati sa Saj_Pretraga_API/Models/Master/AppointmentDtos.cs

export interface CoveredService {
  medUslugaId: number;
  nazivUsluge: string;
  kategorija: string | null;
  paketPodpokriceId: number;
  nazivPodpokrica: string;
  vrstaLimita: string;
}

export interface InstitutionForService {
  medUstanovaId: number;
  nazivUstanove: string;
}

export interface BookAppointmentRequest {
  medUslugaId: number;
  medUstanovaId: number;
  datumPregleda: string;
  vreme: string;
}

export interface BookAppointmentResult {
  onlineUputId: number;
  uputBroj: string;
  status: string;
}

export interface MyAppointment {
  pregledStatusId: number;
  onlineUputId: number;
  uputBroj: string;
  nazivUsluge: string;
  nazivUstanove: string;
  datumPregleda: string | null;
  vreme: string | null;
  status: string;
  canDownloadDocuments: boolean;
  createdAt: string;
  completedAt: string | null;
}

// Mora se poklapati sa Saj_Pretraga_API/Models/Master/DocumentationDtos.cs

export interface SyncDocumentationItem {
  pregledStatusId: number;
  uputBroj: string;
  status: string;
  wasCompletedNow: boolean;
}

export interface DocumentListItem {
  id: number;
  nazivFajla: string;
  tipDokumenta: string;
  fileSize: number | null;
  createdAt: string;
}
