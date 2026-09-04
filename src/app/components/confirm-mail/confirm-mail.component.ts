import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MasterService } from 'src/app/shared/services/master.service';

@Component({
  selector: 'app-confirm-mail',
  templateUrl: './confirm-mail.component.html',
  styleUrls: ['./confirm-mail.component.scss']
})
export class ConfirmMailComponent implements OnInit {

  form!: FormGroup;
  resendForm!: FormGroup;

  loadingConfirm: boolean = false;
  loadingResend: boolean = false;
  confirmed: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private masterService: MasterService,
    private toster: ToastrService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      code: [null, Validators.required]
    });

    this.resendForm = this.fb.group({
      email: [null, [Validators.required, Validators.email]]
    });

    const email = this.route.snapshot.queryParamMap.get('email');
    if (email) {
      this.resendForm.get('email').setValue(email);
    }
  }

  // potvrda mejla unosom koda dobijenog na mejl
  potvrdiKod() {
    if (this.form.invalid) {
      this.form.get('code').markAsDirty();
      return;
    }

    this.loadingConfirm = true;

    this.masterService.confirmEmail({ activationToken: this.form.get('code').value }).subscribe({
      next: (res) => {
        this.loadingConfirm = false;

        if (res.success) {
          this.confirmed = true;
          this.toster.success('Uspešno ste potvrdili vašu e-mail adresu.', 'Globos osiguranje');
        } else {
          this.toster.error(res.message, 'Globos osiguranje');
          this.form.get('code').setValue(null);
        }
      },
      error: () => {
        this.loadingConfirm = false;
        this.form.get('code').setValue(null);
      }
    });
  }

  // ponovno slanje aktivacionog koda
  posaljiKodPonovo() {
    if (this.resendForm.invalid) {
      this.resendForm.get('email').markAsDirty();
      return;
    }

    this.loadingResend = true;

    this.masterService.resendActivationEmail({ email: this.resendForm.get('email').value }).subscribe({
      next: (res) => {
        this.loadingResend = false;

        if (res.success) {
          this.toster.success('Ukoliko nalog postoji, kod je ponovo poslat na e-mail adresu.', 'Globos osiguranje');
        } else {
          this.toster.error(res.message, 'Globos osiguranje');
        }
      },
      error: () => {
        this.loadingResend = false;
      }
    });
  }

  idiNaLogin() {
    this.router.navigate(['/login']);
  }
}
