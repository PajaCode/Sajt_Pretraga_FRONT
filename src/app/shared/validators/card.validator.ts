import { AbstractControl, ValidatorFn } from '@angular/forms';

// Placanje je frontend-only mock (Sprint 2) - PAN/CVV/expiry se NIKAD ne salju
// backendu, ne loguju se i ne cuvaju u localStorage/sessionStorage.

export function cardNumberValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const raw = (control.value || '').replace(/\s/g, '');

    if (!raw) {
      return null;
    }

    if (!/^\d{16}$/.test(raw)) {
      return { cardNumber: true };
    }

    return luhnValid(raw) ? null : { cardNumber: true };
  };
}

function luhnValid(digits: string): boolean {
  let sum = 0;
  let dubluj = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let cifra = digits.charCodeAt(i) - 48;

    if (dubluj) {
      cifra *= 2;
      if (cifra > 9) {
        cifra -= 9;
      }
    }

    sum += cifra;
    dubluj = !dubluj;
  }

  return sum % 10 === 0;
}

export function cardExpiryValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value: string = control.value;

    if (!value) {
      return null;
    }

    const match = /^(\d{2})\/(\d{2})$/.exec(value.trim());
    if (!match) {
      return { expiry: true };
    }

    const month = parseInt(match[1], 10);
    if (month < 1 || month > 12) {
      return { expiry: true };
    }

    const year = 2000 + parseInt(match[2], 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { expiry: true };
    }

    return null;
  };
}

export function cvvValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value: string = control.value;

    if (!value) {
      return null;
    }

    return /^\d{3}$/.test(value) ? null : { cvv: true };
  };
}

// Formatira "1234123412341234" u "1234 1234 1234 1234" dok korisnik kuca.
export function formatCardNumberInput(value: string): string {
  const digits = (value || '').replace(/\D/g, '').slice(0, 16);
  return (digits.match(/.{1,4}/g) || []).join(' ');
}

// Formatira "1234" u "12/34" dok korisnik kuca.
export function formatExpiryInput(value: string): string {
  const digits = (value || '').replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
}
