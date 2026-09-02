import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { timeout } from 'rxjs';
import { ApiService } from 'src/app/shared/services/api.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  form!: FormGroup
  decodedToken: any;

  loadingResetPass: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private apiService: ApiService,
    private toster: ToastrService,
    private spinner: NgxSpinnerService,
    private jwtHelper: JwtHelperService
  ) {
    this.route.params.subscribe(params => {
      const reset_token = params['token'];
      if (reset_token) {
        try {
          this.decodedToken = this.jwtHelper.decodeToken(reset_token);
        } catch (error) {
          console.error('Error decoding token: ', error);
        }
      } else {
        console.error('Token not provided.');
      }
    });

    this.formGrupa();
  }

  ngOnInit(): void { }

  formGrupa() {
    this.form = this.fb.group({
      email: [{ value: this.decodedToken.Email, disabled: true }, [Validators.email, Validators.required]],
      newPassword: [null, [Validators.required, this.passwordValidator()]],
      repeatedNewPassword: [null, [Validators.required, this.passwordValidator()]]
    })

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

    // Check if the form is invalid
    if (this.form.get('newPassword').invalid) {
      this.toster.error('Lozinka je neispravnog formata.', 'Globos osiguranje');
      return;
    }

    if (this.form.invalid) return;

    this.loadingResetPass = true;

    const resetPasswordModel = {
      email: this.form.get('email').value,
      newPassword: this.form.get('newPassword').value,
      repeatedNewPassword: this.form.get('repeatedNewPassword').value
    }
    this.authService.resetForgottenPassword(resetPasswordModel).subscribe(res => {
      if (res.success) {
        this.toster.success(res.message, 'Globos osiguranje');
        this.router.navigate(['/login']);
      }
      else {
        this.toster.error(res.message, 'Globos osiguranje');
        this.form.get('newPassword').setValue(null);
        this.form.get('repeatedNewPassword').setValue(null);
        this.form.markAsDirty();
      }
      this.loadingResetPass = false;
    })

    this.markAllFormControlsAsDirty(this.form);
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
}
