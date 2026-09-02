import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/shared/services/api.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {

  osnovniPodaciForm!: FormGroup;
  resetPassForm!: FormGroup;
  isProfileConfirmed: boolean;

  loadingUpdateUser: boolean = false;
  loadingResetPass: boolean = false;

  user: any;

  skeleton = true;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private toster: ToastrService,
    private authService: AuthService,
  ) {
    this.formGrupe();
  }

  ngOnInit() {
    this.popuniPodatke();
  }

  formGrupe() {
    this.osnovniPodaciForm = this.fb.group({
      username: [{ value: null, disabled: true }, [Validators.required]],
      jmbg: [{ value: null, disabled: true }, [Validators.required]],
      email: [{ value: null, disabled: true }, [Validators.required]],
      ime: [null, [Validators.required]],
      prezime: [null, [Validators.required]],
      brTelefona: [null, [Validators.required]],
      datum: [{ value: null, disabled: true }, [Validators.required]],
    });

    this.resetPassForm = this.fb.group({
      oldPassword: [null, [Validators.required]],
      newPassword: [null, [Validators.required, this.passwordValidator()]],
    });
  }

  popuniPodatke() {
    this.apiService.getUserDetails().subscribe(res => {
      if (res.success) {
        this.user = res.resultList[0];
        setTimeout(() => {
          this.skeleton = false;

          this.osnovniPodaciForm.patchValue({
            username: this.user.username,
            jmbg: this.user.jmbg,
            email: this.user.email,
            ime: this.user.ime,
            prezime: this.user.prezime,
            brTelefona: this.user.brTelefona,
            datum: this.user.datumKreiranja.substring(0, 10).split('-').reverse().join('.') + '.',
          })

          this.isProfileConfirmed = this.user.aktivan;
        }, 500);
      }
      else {
        this.toster.error(res.message, 'Globos osiguranje');
      }
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

  updateUser() {

    if (this.osnovniPodaciForm.invalid) return;

    this.loadingUpdateUser = true;

    const updateUserModel = {
      ime: this.osnovniPodaciForm.value.ime,
      prezime: this.osnovniPodaciForm.value.prezime,
      jmbg: this.user.jmbg,
      brojTelefona: this.osnovniPodaciForm.value.brTelefona,
      email: this.user.email,
      username: this.user.username,
    }

    this.authService.updateUser(updateUserModel).subscribe(res => {
      if (res.success) {
        this.toster.success(res.message, 'Globos osiguranje');
        this.popuniPodatke();
      }
      else {
        this.toster.error(res.message, 'Globos osiguranje');
        this.resetPassForm.markAsDirty();
      }

      this.loadingUpdateUser = false;
    });

    this.markAllFormControlsAsDirty(this.osnovniPodaciForm);
  }

  resetPassword() {


    // Check if the form is invalid
    if (this.resetPassForm.get('newPassword').invalid) {
      this.toster.error('Lozinka je neispravnog formata.', 'Globos osiguranje');
      return;
    }
    if (this.resetPassForm.invalid) return;

    this.loadingResetPass = true;

    const resetPasswordModel = {
      email: this.user.email,
      oldPassword: this.resetPassForm.get('oldPassword').value,
      newPassword: this.resetPassForm.get('newPassword').value
    }

    this.authService.resetPassword(resetPasswordModel).subscribe(res => {
      if (res.success) {
        this.toster.success(res.message, 'Globos osiguranje');
        this.resetPassForm.reset();
      }
      else {
        this.toster.error(res.message, 'Globos osiguranje');
        this.resetPassForm.reset();
        this.resetPassForm.markAsDirty();
      }
      this.loadingResetPass = false;
    })

    this.markAllFormControlsAsDirty(this.resetPassForm);
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
