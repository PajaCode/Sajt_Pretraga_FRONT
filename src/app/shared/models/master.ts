// Mora se poklapati sa Saj_Pretraga_API/Models/Master/PackageDtos.cs, PaymentDtos.cs, PurchaseDtos.cs, RegistrationDtos.cs

export interface RegisterRequest {
  ime: string;
  prezime: string;
  email: string;
  username: string;
  password: string;
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
  ime: string;
  prezime: string;
  jmbg: string;
  datumRodjenja: string;
}

export interface PurchaseCompleteResult {
  brKartice: string;
  brPolise: string;
  paketId: number;
  status: string;
}
