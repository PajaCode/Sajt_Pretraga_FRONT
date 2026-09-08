import { AbstractControl, ValidatorFn } from '@angular/forms';

// Jedina password policy u projektu - koriste je registracija, reset lozinke i promena
// lozinke u profilu (isto pravilo svuda, Saj_Pretraga_API/Helpers/PasswordPolicy.cs).
// Max 50 zbog legacy Portal_UserLogin VARCHAR(50).
// Specijalni karakteri su namerno ogranicen ASCII skup (bezbedan za legacy hash flow).
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 50;
export const PASSWORD_SPECIAL_CHARS = '!@#$%^&*()_+-=.?';
export const PASSWORD_POLICY_HINT =
  `Lozinka mora imati ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} karaktera, ` +
  `bar jedno veliko slovo, jedno malo slovo, jedan broj i jedan specijalni karakter (${PASSWORD_SPECIAL_CHARS}).`;

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=.?-]).{8,50}$/;

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;

    if (!value) {
      return null; // don't validate empty value
    }

    return PASSWORD_PATTERN.test(value)
      ? null
      : { passwordStrength: { value } };
  };
}
