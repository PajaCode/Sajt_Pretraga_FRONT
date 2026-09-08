import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';
import { CurrentUserService } from 'src/app/shared/services/current-user.service';
import { MasterService } from 'src/app/shared/services/master.service';
import { CurrentUser } from 'src/app/shared/models/current-user';
import { jmbgValidator, tryValidateJmbg } from 'src/app/shared/validators/jmbg.validator';
import { passwordValidator, PASSWORD_POLICY_HINT } from 'src/app/shared/validators/password.validator';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrls: ['./profil.component.scss']
})
export class ProfilComponent implements OnInit {

  osnovniPodaciForm!: FormGroup;
  resetPassForm!: FormGroup;

  loadingUpdateUser: boolean = false;
  loadingResetPass: boolean = false;

  // Source of truth za identitet je CurrentUserService (GET /api/Master/me), ne legacy ApiService.
  user: CurrentUser | null = null;

  skeleton = true;

  readonly passwordPolicyHint = PASSWORD_POLICY_HINT;

  constructor(
    private fb: FormBuilder,
    private currentUserService: CurrentUserService,
    private masterService: MasterService,
    private authService: AuthService,
    private toster: ToastrService,
  ) {
    this.formGrupe();
  }

  ngOnInit() {
    this.popuniPodatke();
  }

  formGrupe() {
    this.osnovniPodaciForm = this.fb.group({
      username: [{ value: null, disabled: true }],
      email: [{ value: null, disabled: true }],
      ime: [null, [Validators.required]],
      prezime: [null, [Validators.required]],
      brTelefona: [null, [Validators.required]],
      jmbg: [null, [Validators.required, jmbgValidator()]],
      datumRodjenja: [{ value: null, disabled: true }],
    });

    this.resetPassForm = this.fb.group({
      oldPassword: [null, [Validators.required]],
      newPassword: [null, [Validators.required, passwordValidator()]],
    });

    // JMBG validan -> automatski derivira DatumRodjenja (read-only); JMBG invalid -> ocisti ga.
    this.osnovniPodaciForm.controls['jmbg'].valueChanges.subscribe(value => {
      const { valid, datumRodjenja } = tryValidateJmbg(value);
      this.osnovniPodaciForm.controls['datumRodjenja'].setValue(valid ? datumRodjenja : null);
    });
  }

  popuniPodatke() {
    this.currentUserService.ensureLoaded().subscribe(user => {
      this.skeleton = false;

      if (!user) {
        this.toster.error('Nije moguće učitati profil.', 'Globos osiguranje');
        return;
      }

      this.applyUser(user);
    });
  }

  private applyUser(user: CurrentUser): void {
    this.user = user;

    this.osnovniPodaciForm.patchValue({
      username: user.username,
      email: user.email,
      ime: user.ime,
      prezime: user.prezime,
      brTelefona: user.telefon,
      jmbg: user.jmbg,
      datumRodjenja: user.datumRodjenja ? new Date(user.datumRodjenja) : null,
    });

    // JMBG i DatumRodjenja postaju read-only nakon validnog postavljanja - "Dopuni profil"
    // (editabilan JMBG) je dozvoljen samo dok nalog jos nema JMBG.
    if (user.jmbg) {
      this.osnovniPodaciForm.controls['jmbg'].disable();
    } else {
      this.osnovniPodaciForm.controls['jmbg'].enable();
    }
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
    if (this.osnovniPodaciForm.invalid) {
      this.markAllFormControlsAsDirty(this.osnovniPodaciForm);
      return;
    }

    this.loadingUpdateUser = true;

    // PortalUserId se NE salje - MasterController ga uzima iz CurrentUserService (JWT).
    this.masterService.updateProfile({
      ime: this.osnovniPodaciForm.value.ime,
      prezime: this.osnovniPodaciForm.value.prezime,
      brTelefona: this.osnovniPodaciForm.value.brTelefona,
      jmbg: this.osnovniPodaciForm.getRawValue().jmbg,
    }).subscribe({
      next: (res) => {
        this.loadingUpdateUser = false;

        if (res.success) {
          this.toster.success(res.message, 'Globos osiguranje');
          this.currentUserService.refresh().subscribe(user => {
            if (user) {
              this.applyUser(user);
            }
          });
        } else {
          this.toster.error(res.message, 'Globos osiguranje');
        }
      },
      error: () => {
        this.loadingUpdateUser = false;
      }
    });

    this.markAllFormControlsAsDirty(this.osnovniPodaciForm);
  }

  resetPassword() {
    if (this.resetPassForm.get('newPassword').invalid) {
      this.toster.error('Lozinka je neispravnog formata.', 'Globos osiguranje');
      this.markAllFormControlsAsDirty(this.resetPassForm);
      return;
    }

    if (this.resetPassForm.invalid) return;

    this.loadingResetPass = true;

    const resetPasswordModel = {
      email: this.user?.email,
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
}
