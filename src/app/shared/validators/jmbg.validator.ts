import { AbstractControl, ValidatorFn } from '@angular/forms';

// Mora se poklapati sa Saj_Pretraga_API/Helpers/JmbgValidator.cs (format + kontrolna cifra + datum).
// Jedini JMBG validator u projektu - koriste ga register i profil "Dopuni profil" flow.
export function tryValidateJmbg(jmbg: string | null | undefined): { valid: boolean; datumRodjenja: Date | null } {
  if (!jmbg || jmbg.length !== 13 || !/^\d{13}$/.test(jmbg)) {
    return { valid: false, datumRodjenja: null };
  }

  const d = jmbg.split('').map(c => c.charCodeAt(0) - 48);

  const day = d[0] * 10 + d[1];
  const month = d[2] * 10 + d[3];
  const yearPart = d[4] * 100 + d[5] * 10 + d[6];
  // JMBG kodira samo poslednje 3 cifre godine - konvencija (000-799 -> 2000-2799, 800-999 -> 1800-1999).
  const year = yearPart >= 800 ? 1000 + yearPart : 2000 + yearPart;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth) {
    return { valid: false, datumRodjenja: null };
  }

  const suma = 7 * (d[0] + d[6]) + 6 * (d[1] + d[7]) + 5 * (d[2] + d[8])
    + 4 * (d[3] + d[9]) + 3 * (d[4] + d[10]) + 2 * (d[5] + d[11]);
  const ostatak = suma % 11;
  const kontrolna = ostatak === 0 ? 0 : 11 - ostatak;

  if (kontrolna === 10 || kontrolna !== d[12]) {
    return { valid: false, datumRodjenja: null };
  }

  return { valid: true, datumRodjenja: new Date(year, month - 1, day) };
}

export function jmbgValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    if (!control.value) {
      return null;
    }

    return tryValidateJmbg(control.value).valid ? null : { jmbg: true };
  };
}
