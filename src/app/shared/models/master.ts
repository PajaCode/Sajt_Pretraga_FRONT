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
  brojUstanova: number;
  cenaMin: number | null;
  cenaMax: number | null;
}

export interface PackageSubCoverage {
  id: number;
  nazivPodpokrica: string;
  vrstaLimita: string;
  limitVrednost: number | null;
  sumaOsiguranja: number | null;
  usluge: PackageCoveredService[];
  iskorisceno: number | null;
  rezervisano: number | null;
  preostalo: number | null;
}

export interface PackageCoverage {
  id: number;
  nazivPokrice: string;
  sumaOsiguranja: number | null;
  ucesceProcenat: number | null;
  podpokrica: PackageSubCoverage[];
  iskorisceno: number | null;
  rezervisano: number | null;
  preostalo: number | null;
}

export interface PackageUsageHistoryItem {
  pregledStatusId: number;
  datumPregleda: string | null;
  nazivUsluge: string;
  nazivUstanove: string | null;
  cena: number | null;
  valuta: string | null;
  status: string;
  nazivPokrica: string | null;
  nazivPodpokrica: string | null;
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
  istorijaKoriscenja: PackageUsageHistoryItem[] | null;
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
  brKartice?: string | null;
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
  remainingAmount: number | null;
  remainingVisits: number | null;
}

export interface InstitutionForService {
  medUstanovaId: number;
  nazivUstanove: string;
  grad: string | null;
  adresa: string | null;
  cena: number | null;
  valuta: string | null;
}

// FIX D - MR_GetMedUstanovaRadnoVreme. DanUNedelji je ISO 8601 (1=Ponedeljak..7=Nedelja).
// VremeOd/VremeDo dolaze kao "HH:mm:ss" (TimeSpan serijalizacija).
export interface WorkingHour {
  danUNedelji: number;
  vremeOd: string;
  vremeDo: string;
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
  cena: number | null;
  valuta: string | null;
  vrstaLimita: string | null;
  remainingAmount: number | null;
  remainingVisits: number | null;
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
