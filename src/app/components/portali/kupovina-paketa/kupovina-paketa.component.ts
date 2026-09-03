import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/shared/services/current-user.service';
import { MasterService } from 'src/app/shared/services/master.service';
import { PackageListItem } from 'src/app/shared/models/master';

type Step = 'select' | 'payment' | 'complete';

@Component({
  selector: 'app-kupovina-paketa',
  templateUrl: './kupovina-paketa.component.html',
  styleUrls: ['./kupovina-paketa.component.scss']
})
export class KupovinaPaketaComponent implements OnInit {

  step: Step = 'select';

  loadingPackages: boolean = true;
  packages: PackageListItem[] = [];
  selectedPackage: PackageListItem | null = null;

  loadingPayment: boolean = false;
  internalTransactionId: string | null = null;
  paymentAmount: number | null = null;
  paymentCurrency: string | null = null;

  loadingComplete: boolean = false;
  completeForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private currentUserService: CurrentUserService,
    private router: Router,
    private toster: ToastrService,
  ) {
    this.completeForm = this.fb.group({
      ime: [null, [Validators.required]],
      prezime: [null, [Validators.required]],
      jmbg: [null, [Validators.required, Validators.pattern(/^\d{13}$/)]],
      datumRodjenja: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    // PurchaseGuard vec sprecava pristup korisniku sa aktivnim paketom pre nego sto
    // se ova komponenta uopste ucita - nema potrebe za istom proverom ovde.
    this.masterService.getPackages().subscribe({
      next: res => {
        this.loadingPackages = false;
        if (res.success) {
          this.packages = res.data || [];
        }
      },
      error: () => this.loadingPackages = false,
    });
  }

  choosePackage(paket: PackageListItem) {
    if (this.loadingPayment) {
      return;
    }

    this.selectedPackage = paket;
    this.loadingPayment = true;

    this.masterService.initiatePayment(paket.id).subscribe({
      next: res => {
        this.loadingPayment = false;
        if (res.success && res.data) {
          this.internalTransactionId = res.data.internalTransactionId;
          this.paymentAmount = res.data.amount;
          this.paymentCurrency = res.data.currency;
          this.step = 'payment';
        } else {
          this.toster.error(res.message, 'Globos osiguranje');
        }
      },
      error: () => this.loadingPayment = false,
    });
  }

  confirmMockPayment(success: boolean) {
    if (this.loadingPayment || !this.internalTransactionId) {
      return;
    }

    this.loadingPayment = true;

    this.masterService.confirmMockPayment({
      internalTransactionId: this.internalTransactionId,
      success,
    }).subscribe({
      next: res => {
        this.loadingPayment = false;
        if (res.success && res.data?.status === 'Paid') {
          this.step = 'complete';
        } else {
          this.toster.error('Plaćanje nije uspelo. Pokušajte ponovo.', 'Globos osiguranje');
        }
      },
      error: () => this.loadingPayment = false,
    });
  }

  submitComplete() {
    if (this.completeForm.invalid || this.loadingComplete || !this.internalTransactionId) {
      this.completeForm.markAllAsTouched();
      return;
    }

    this.loadingComplete = true;

    this.masterService.completePurchase({
      internalTransactionId: this.internalTransactionId,
      ime: this.completeForm.value.ime,
      prezime: this.completeForm.value.prezime,
      jmbg: this.completeForm.value.jmbg,
      datumRodjenja: this.completeForm.value.datumRodjenja,
    }).subscribe({
      next: res => {
        this.loadingComplete = false;
        if (res.success) {
          this.currentUserService.refresh().subscribe(user => {
            this.toster.success('Paket je uspešno aktiviran.', 'Globos osiguranje');
            this.router.navigate(user ? this.currentUserService.landingRoute(user) : ['/paketi']);
          });
        } else {
          this.toster.error(res.message, 'Globos osiguranje');
        }
      },
      error: () => this.loadingComplete = false,
    });
  }
}
