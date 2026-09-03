import { Component, OnInit, Pipe } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, ValidatorFn } from '@angular/forms';
import { Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LoginUser } from 'src/app/shared/models/login-user';
import { ApiService } from 'src/app/shared/services/api.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmailService } from 'src/app/shared/services/email.service';
import { NgbDateParserFormatter, NgbDateStruct, NgbDatepicker, NgbDatepickerConfig, NgbInputDatepicker } from '@ng-bootstrap/ng-bootstrap';
import { get } from 'jquery';
import * as moment from 'moment';
import en from '@angular/common/locales/sr';
import { DatePipe, registerLocaleData } from '@angular/common';
import { CustomDateParserFormatter } from 'src/app/shared/dateFormating/customDateParserFormatter';
import { CurrentUserService } from 'src/app/shared/services/current-user.service';


@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ]
})


export class LoginRegisterComponent implements OnInit {
  form!: FormGroup
  formReset!: FormGroup
  model: NgbDateStruct;
  url: string;

  visible: boolean;

  loadingSendEmail: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private apiService: ApiService,
    private emailService: EmailService,
    private toster: ToastrService,
    private spinner: NgxSpinnerService,
    private jwtHelper: JwtHelperService,
    private datePipe: DatePipe,
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
      ime: [null, Validators.required],
      prezime: [null, Validators.required],
      brKartice: [null, Validators.required],
      datumRodjenja: [null, Validators.required],
      brTelefona: [null, Validators.required],
      email: [null, [Validators.email, Validators.required]],
      username: [null, Validators.required],
      password: [null, [Validators.required, this.passwordValidator()]]
    })

    if (this.url === '/login') {
      this.form.controls['ime'].setValidators(null);
      this.form.controls['prezime'].setValidators(null);
      this.form.controls['brKartice'].setValidators(null);
      this.form.controls['datumRodjenja'].setValidators(null);
      this.form.controls['email'].setValidators(null);
      this.form.controls['brTelefona'].setValidators(null);
    }
    else if (this.url === '/register') {
      this.form.controls['ime'].setValidators([Validators.required]);
      this.form.controls['prezime'].setValidators([Validators.required]);
      this.form.controls['brKartice'].setValidators([Validators.required]);
      this.form.controls['datumRodjenja'].setValidators([Validators.required]);
      this.form.controls['email'].setValidators([Validators.email, Validators.required]);
      this.form.controls['brTelefona'].setValidators([Validators.required]);

    }

    this.form.controls['ime'].updateValueAndValidity();
    this.form.controls['prezime'].updateValueAndValidity();
    this.form.controls['brKartice'].updateValueAndValidity();
    this.form.controls['datumRodjenja'].updateValueAndValidity();
    this.form.controls['brTelefona'].updateValueAndValidity();
    this.form.controls['email'].updateValueAndValidity();
  }

  // inicializacija forme za reset password
  formResetGrupa() {
    this.formReset = this.fb.group({
      emailReset: [null, [Validators.email, Validators.required]],
    })
  }

  // validacija inputa za duzinu i za brojeve
  lengthChecker(control: string, duzina: number) {
    const controlName = this.form.get(control);

    if (controlName.dirty && controlName.value.length < duzina) {
      controlName.setErrors({ invalidLength: true });
    }
  }

  // validacija inputa već postojeće u bazi
  inputChecker(parametar: number, controlName: string) {
    if (this.url === '/login') return;

    var vrednost = this.form.get(controlName).value;

    if (this.form.get(controlName).valid) {
      if (vrednost) {
        this.apiService.proveraPolja(parametar, vrednost).subscribe(res => {
          if (res.success) {
            if (res.resultList[0].status == 0) {
              this.toster.error(res.resultList[0].poruka, 'Globos osiguranje');
              this.form.get(controlName).setValue(null);
            }
          } else {
            this.toster.error('Greska: ', 'Globos osiguranje');
            this.form.get(controlName).setValue(null);
          }
        });
      }
    }
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

  // dugme za slanje mail-a za resetovanje lozinke
  posaljiMail() {
    this.loadingSendEmail = true;

    const Email = {
      emailRecipient: this.formReset.get('emailReset').value,
      tip: 2
    }

    const emailReq = {
      emailSubject: Email,
      userReg: null,
      aktivan: true

    };

    this.emailService.sendEmail(emailReq).subscribe(res => {
      if (res.success) {
        this.toster.success(res.message, 'Globos osiguranje');
        this.visible = false;
      }
      else {
        this.toster.error(res.message, 'Globos osiguranje');
        this.formReset.reset();
        this.formReset.get('emailReset').markAsDirty();
      }

      this.loadingSendEmail = false;
    });

  }

  // dugme za potvrdu
  potvrdi() {

    // ako je url login onda se poziva login funkcija
    if (this.url === '/login') {

      var userLogin = {
        username: this.form.controls['username'].value,
        password: this.form.controls['password'].value
      }

      this.authService.login(userLogin).subscribe((res: any) => {
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
            this.toster.error('Morate potvrditi mail adresu.', 'Globos osiguranje');
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

      // Check if the form is invalid
      if (this.form.get('password').invalid) {
        this.toster.error('Lozinka je neispravnog formata.', 'Globos osiguranje');
        return;
      }

      let ngbDate = this.form.controls['datumRodjenja'].value;
      let ngbDateModel = new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
      let formatedDatePipe: any = this.datePipe.transform(ngbDateModel, 'yyyy-MM-dd');

      var userRegister = {
        ime: this.form.controls['ime'].value,
        prezime: this.form.controls['prezime'].value,
        brojTelefona: this.form.get('brTelefona').value.replace(/[/\s-]/g, ''),
        brKartice: this.form.controls['brKartice'].value,
        datumRodjenja: formatedDatePipe,
        email: this.form.controls['email'].value,
        username: this.form.controls['username'].value,
        password: this.form.controls['password'].value,
        vrstaOsiguranja: 1
      }

      this.authService.register(userRegister).subscribe((res: any) => {
        if (res.success) {
          if (res.resultList[0].status == 1) {
            this.toster.success('Uspešno poslat link ka aktivaciji.', 'Globos osiguranje');
            this.spinner.show();
            this.router.navigate(['/confirm-mail', res.token]);
            this.authService.setToken('email-token', res.token);
            this.spinner.hide();
          }
          else if (res.resultList[0].status == 0) {
            this.toster.error(res.resultList[0].poruka, 'Globos osiguranje');
            this.form.reset();
            this.spinner.hide();
          }
        } else {
          this.toster.error(res.message, 'Globos osiguranje');
          this.form.reset();
        }
      })


    }

    this.markAllFormControlsAsDirty(this.form);
    // this.spinner.hide();
  }

  getCurrentYear(): any {
    //only current year
    var today = new Date();
    var yyyy = today.getFullYear();
    return yyyy;
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
