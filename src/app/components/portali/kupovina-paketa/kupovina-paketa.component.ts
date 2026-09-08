import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/shared/services/current-user.service';
import { MasterService } from 'src/app/shared/services/master.service';
import { CurrentUser } from 'src/app/shared/models/current-user';
import { PackageDetails, PackageListItem } from 'src/app/shared/models/master';
import { cardExpiryValidator, cardNumberValidator, cvvValidator, formatCardNumberInput, formatExpiryInput } from 'src/app/shared/validators/card.validator';

type Step = 'select' | 'review' | 'payment' | 'processing';

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

  loadingDetails: boolean = false;
  packageDetails: PackageDetails | null = null;
  showDetailsDialog: boolean = false;

  user: CurrentUser | null = null;
  profileComplete: boolean = false;

  processingMessage: string | null = null;

  cardForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private currentUserService: CurrentUserService,
    private router: Router,
    private toster: ToastrService,
  ) {
    this.cardForm = this.fb.group({
      brojKartice: [null, [Validators.required, cardNumberValidator()]],
      vaziDo: [null, [Validators.required, cardExpiryValidator()]],
      cvv: [null, [Validators.required, cvvValidator()]],
      imeNaKartici: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    // PurchaseGuard vec sprecava pristup korisniku sa aktivnim paketom pre nego sto
    // se ova komponenta uopste ucita - nema potrebe za istom proverom ovde.
    this.user = this.currentUserService.snapshot ?? null;
    this.profileComplete = this.isProfileComplete(this.user);

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

  private isProfileComplete(user: CurrentUser | null): boolean {
    return !!user && !!user.ime && !!user.prezime && !!user.telefon && !!user.jmbg && !!user.datumRodjenja;
  }

  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatCardNumberInput(input.value);
    this.cardForm.controls['brojKartice'].setValue(formatted, { emitEvent: false });
  }

  onExpiryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = formatExpiryInput(input.value);
    this.cardForm.controls['vaziDo'].setValue(formatted, { emitEvent: false });
  }

  choosePackage(paket: PackageListItem): void {
    this.selectedPackage = paket;
    this.step = 'review';
  }

  openDetails(paket: PackageListItem): void {
    this.loadingDetails = true;
    this.showDetailsDialog = true;

    this.masterService.getPackageDetails(paket.id).subscribe({
      next: res => {
        this.loadingDetails = false;
        if (res.success) {
          this.packageDetails = res.data || null;
        } else {
          this.toster.error(res.message, 'Globos osiguranje');
        }
      },
      error: () => this.loadingDetails = false,
    });
  }

  goToProfile(): void {
    this.router.navigate(['/profil']);
  }

  backToSelect(): void {
    this.step = 'select';
    this.selectedPackage = null;
  }

  continueToPayment(): void {
    if (!this.profileComplete || !this.selectedPackage) {
      return;
    }

    this.step = 'payment';
  }

  backToReview(): void {
    this.step = 'review';
  }

  pay(): void {
    if (this.cardForm.invalid || !this.selectedPackage) {
      this.cardForm.markAllAsTouched();
      return;
    }

    this.step = 'processing';
    this.processingMessage = 'Obrada plaćanja...';

    this.masterService.initiatePayment(this.selectedPackage.id).subscribe({
      next: initiateRes => {
        if (!initiateRes.success || !initiateRes.data) {
          this.paymentFailed();
          return;
        }

        const internalTransactionId = initiateRes.data.internalTransactionId;

        this.masterService.confirmMockPayment({ internalTransactionId, success: true }).subscribe({
          next: confirmRes => {
            if (!confirmRes.success || confirmRes.data?.status !== 'Paid') {
              this.paymentFailed();
              return;
            }

            this.masterService.completePurchase({ internalTransactionId }).subscribe({
              next: completeRes => {
                if (!completeRes.success) {
                  this.paymentFailed();
                  return;
                }

                this.currentUserService.refresh().subscribe(user => {
                  this.toster.success('Paket je uspešno aktiviran.', 'Globos osiguranje');
                  this.router.navigate(user ? this.currentUserService.landingRoute(user) : ['/paketi']);
                });
              },
              error: () => this.paymentFailed(),
            });
          },
          error: () => this.paymentFailed(),
        });
      },
      error: () => this.paymentFailed(),
    });
  }

  private paymentFailed(): void {
    this.toster.error('Plaćanje nije uspešno. Pokušajte ponovo.', 'Globos osiguranje');
    this.step = 'payment';
    this.processingMessage = null;
  }
}
