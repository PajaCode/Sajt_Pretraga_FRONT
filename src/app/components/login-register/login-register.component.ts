import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, ValidatorFn } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';
import { MasterService } from 'src/app/shared/services/master.service';
import { RegisterRequest } from 'src/app/shared/models/master';
import { CurrentUserService } from 'src/app/shared/services/current-user.service';


@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss']
})


export class LoginRegisterComponent implements OnInit {
  form!: FormGroup
  formReset!: FormGroup
  url: string;

  visible: boolean;

  loadingSendEmail: boolean = false;
  loadingSubmit: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private masterService: MasterService,
    private toster: ToastrService,
    private spinner: NgxSpinnerService,
    private jwtHelper: JwtHelperService,
    private currentUserService: CurrentUserService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.url = event.url;
        this.formGrupa();
      }
    });

    this.formResetGrupa();
  }

  ngOnInit(): void {
  }

  // inicializacija forme za login i register
  formGrupa() {
    this.form = this.fb.group({
      ime: [null],
      prezime: [null],
      email: [null],
      username: [null, Validators.required],
      password: [null, [Validators.required, this.passwordValidator()]],
      confirmPassword: [null]
    }, { validators: this.passwordsMatchValidator() })

    if (this.url === '/register') {
      this.form.controls['ime'].setValidators([Validators.required]);
      this.form.controls['prezime'].setValidators([Validators.required]);
      this.form.controls['email'].setValidators([Validators.email, Validators.required]);
      this.form.controls['confirmPassword'].setValidators([Validators.required]);
    }

    this.form.controls['ime'].updateValueAndValidity();
    this.form.controls['prezime'].updateValueAndValidity();
    this.form.controls['email'].updateValueAndValidity();
    this.form.controls['confirmPassword'].updateValueAndValidity();
  }

  // inicializacija forme za reset password
  formResetGrupa() {
    this.formReset = this.fb.group({
      emailReset: [null, [Validators.email, Validators.required]],
    })
  }

  // klikom na dugme potvrdi se poziva ova funkcija koja proverava da li su sva polja validna
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

  // funkcija za promenu url-a
  changeLoginRegisterUrl(): string {
    if (this.url === '/login')
      return '/register';
    else
      return '/login';
  }

  // dugme za slanje mail-a za resetovanje lozinke (Account Lifecycle - Master forgot-password flow)
  posaljiMail() {
    if (this.loadingSendEmail) return;

    if (this.formReset.invalid) {
      this.formReset.get('emailReset').markAsDirty();
      return;
    }

    const email = (this.formReset.get('emailReset').value || '').trim();

    this.loadingSendEmail = true;

    this.masterService.forgotPassword({ email }).subscribe({
      next: (res) => {
        this.loadingSendEmail = false;
        this.toster.success(res.message, 'Globos osiguranje');
        this.visible = false;
        this.formReset.reset();
      },
      error: () => {
        this.loadingSendEmail = false;
      }
    });
  }

  // dugme za potvrdu
  potvrdi() {

    if (this.loadingSubmit) return;

    // ako je url login onda se poziva login funkcija
    if (this.url === '/login') {

      var userLogin = {
        username: this.form.controls['username'].value,
        password: this.form.controls['password'].value
      }

      this.loadingSubmit = true;

      this.authService.login(userLogin).subscribe((res: any) => {
        this.loadingSubmit = false;

        if (res.success) {
          const decodedToken = this.jwtHelper.decodeToken(res.token);
          if (decodedToken.Aktivan) {
            this.authService.setToken('user-token', res.token);
            this.spinner.show();

            // Ne navigiraj odmah posle login-a - prvo mora da se ucita /api/Master/me
            // da bi se znalo da li korisnik ima aktivan paket (destinacija zavisi od
            // stvarnog account state-a, ne salje se svako na home).
            this.currentUserService.refresh().subscribe(user => {
              this.spinner.hide();

              if (!user) {
                this.toster.error('Nije moguće učitati nalog. Pokušajte ponovo.', 'Globos osiguranje');
                this.authService.deleteAllTokens();
                this.currentUserService.clear();
                return;
              }

              this.toster.success('Dobrodošao/la ' + decodedToken.Username, 'Globos osiguranje');

              if (this.currentUserService.isBlocked(user)) {
                this.toster.error('Nalog je blokiran. Kontaktirajte podršku.', 'Globos osiguranje');
                return;
              }

              this.router.navigate(this.currentUserService.landingRoute(user));
            });
          }
          else if (!decodedToken.Aktivan) {
            this.toster.error('Morate potvrditi mail adresu. Kod za potvrdu je poslat na registrovanu adresu.', 'Globos osiguranje');
            this.form.controls['password'].setValue(null);
          }
        }
        else {
          this.form.controls['password'].setValue(null);
          this.toster.error(res.message, 'Globos osiguranje');
        }
      })
    }
    // ako je url register onda se poziva register funkcija
    else if (this.url === '/register') {

      if (this.form.get('password').invalid) {
        this.toster.error('Lozinka je neispravnog formata.', 'Globos osiguranje');
        this.markAllFormControlsAsDirty(this.form);
        return;
      }

      if (this.form.hasError('passwordMismatch')) {
        this.toster.error('Lozinke se ne poklapaju.', 'Globos osiguranje');
        this.markAllFormControlsAsDirty(this.form);
        return;
      }

      if (this.form.invalid) {
        this.markAllFormControlsAsDirty(this.form);
        return;
      }

      const registerRequest: RegisterRequest = {
        ime: this.form.controls['ime'].value,
        prezime: this.form.controls['prezime'].value,
        email: this.form.controls['email'].value,
        username: this.form.controls['username'].value,
        password: this.form.controls['password'].value
      }

      this.loadingSubmit = true;

      this.masterService.register(registerRequest).subscribe({
        next: (res) => {
          this.loadingSubmit = false;

          if (res.success) {
            this.toster.success('Uspešno ste se registrovali. Proverite e-mail za aktivacioni kod.', 'Globos osiguranje');
            this.form.reset();
            this.router.navigate(['/confirm-mail'], { queryParams: { email: registerRequest.email } });
          } else {
            this.toster.error(res.message, 'Globos osiguranje');
          }
        },
        error: () => {
          this.loadingSubmit = false;
        }
      });

      return;
    }

    this.markAllFormControlsAsDirty(this.form);
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;

      if (!value) {
        return null; // don't validate empty value
      }

      return value.length >= 6 ? null : { 'passwordStrength': { value: control.value } };
    };
  }

  passwordsMatchValidator(): ValidatorFn {
    return (group: AbstractControl): { [key: string]: any } | null => {
      const password = group.get('password')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;

      if (!confirmPassword) {
        return null;
      }

      return password === confirmPassword ? null : { 'passwordMismatch': true };
    };
  }

}
