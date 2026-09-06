import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MasterService } from 'src/app/shared/services/master.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  form!: FormGroup;

  // Token iz rute se drzi samo u memoriji (component field) - nikad u localStorage/
  // sessionStorage/console.log. Frontend ga ne dekodira radi security odluka -
  // backend je jedini autoritet (Account Lifecycle).
  private token: string = '';

  loadingResetPass: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private masterService: MasterService,
    private toster: ToastrService,
  ) {
    this.route.params.subscribe(params => {
      this.token = params['token'] || '';
    });

    this.formGrupa();
  }

  ngOnInit(): void { }

  formGrupa() {
    this.form = this.fb.group({
      newPassword: [null, [Validators.required, this.passwordValidator()]],
      repeatedNewPassword: [null, [Validators.required]]
    }, { validators: this.passwordsMatchValidator() });
  }

  private markAllFormControlsAsDirty(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach((controlName) => {
      const control = formGroup.get(controlName);

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllFormControlsAsDirty(control);
      } else if (control instanceof FormControl) {
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    });
  }

  potvrdi() {
    this.markAllFormControlsAsDirty(this.form);

    if (!this.token) {
      this.toster.error('Link za promenu lozinke nije validan.', 'Globos osiguranje');
      return;
    }

    if (this.form.get('newPassword').invalid) {
      this.toster.error('Lozinka je neispravnog formata.', 'Globos osiguranje');
      return;
    }

    if (this.form.hasError('passwordMismatch')) {
      this.toster.error('Lozinke se ne poklapaju.', 'Globos osiguranje');
      return;
    }

    if (this.form.invalid || this.loadingResetPass) return;

    this.loadingResetPass = true;

    this.masterService.resetPassword({
      token: this.token,
      newPassword: this.form.get('newPassword').value
    }).subscribe({
      next: (res) => {
        this.loadingResetPass = false;

        if (res.success) {
          this.toster.success(res.message, 'Globos osiguranje');
          this.router.navigate(['/login']);
        } else {
          this.toster.error(res.message, 'Globos osiguranje');
          this.form.reset();
        }
      },
      error: () => {
        this.loadingResetPass = false;
      }
    });
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;

      if (!value) {
        return null; // don't validate empty value
      }

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const isValidLength = value.length >= 6;

      const passwordValid = hasUpperCase && hasLowerCase && hasNumber && isValidLength;

      return !passwordValid ? { 'passwordStrength': { value: control.value } } : null;
    };
  }

  passwordsMatchValidator(): ValidatorFn {
    return (group: AbstractControl): { [key: string]: any } | null => {
      const newPassword = group.get('newPassword')?.value;
      const repeatedNewPassword = group.get('repeatedNewPassword')?.value;

      if (!repeatedNewPassword) {
        return null;
      }

      return newPassword === repeatedNewPassword ? null : { 'passwordMismatch': true };
    };
  }
}
