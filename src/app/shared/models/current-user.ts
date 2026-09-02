// Mora se poklapati sa Saj_Pretraga_API/Models/Master/CurrentUserDto.cs (System.Text.Json camelCase).
export interface CurrentUser {
  portalUserId: number;
  username: string;
  ime: string;
  prezime: string;
  email: string;
  telefon: string | null;
  jmbg: string | null;
  datumRodjenja: string | null;
  brKartice: string | null;
  brPolise: string | null;
  paketId: number | null;
  accountStatus: string;
  hasActivePackage: boolean;
  requiresPackagePurchase: boolean;
  packageActivatedAt: string | null;
  packageExpiresAt: string | null;
}
