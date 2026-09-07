import { AbstractControl, ValidatorFn } from '@angular/forms';

// Jedina password policy u projektu - koriste je registracija, reset lozinke i promena
// lozinke u profilu (isto pravilo svuda, Saj_Pretraga_API/Helpers/PasswordPolicy.cs).
// Max 50 zbog legacy Portal_UserLogin VARCHAR(50).
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 50;

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value;

    if (!value) {
      return null; // don't validate empty value
    }

    return value.length >= PASSWORD_MIN_LENGTH && value.length <= PASSWORD_MAX_LENGTH
      ? null
      : { passwordStrength: { value } };
  };
}
