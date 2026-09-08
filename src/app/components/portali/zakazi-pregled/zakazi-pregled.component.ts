import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MasterService } from 'src/app/shared/services/master.service';
import { CoveredService, InstitutionForService } from 'src/app/shared/models/master';

// Datum ne sme biti u proslosti - poredi se kao YYYY-MM-DD string (bez vremenske zone).
function notPastDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) {
    return null;
  }

  const danas = new Date();
  const todayStr = danas.getFullYear() + '-' + String(danas.getMonth() + 1).padStart(2, '0') + '-' + String(danas.getDate()).padStart(2, '0');

  return control.value < todayStr ? { pastDate: true } : null;
}

@Component({
  selector: 'app-zakazi-pregled',
  templateUrl: './zakazi-pregled.component.html',
  styleUrls: ['./zakazi-pregled.component.scss']
})
export class ZakaziPregledComponent implements OnInit {

  minDatum: string;

  loadingUsluge: boolean = true;
  coveredServices: CoveredService[] = [];

  loadingUstanove: boolean = false;
  institutions: InstitutionForService[] = [];

  submitting: boolean = false;

  zakaziForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private router: Router,
    private toster: ToastrService,
  ) {
    const danas = new Date();
    this.minDatum = danas.getFullYear() + '-' + String(danas.getMonth() + 1).padStart(2, '0') + '-' + String(danas.getDate()).padStart(2, '0');

    this.zakaziForm = this.fb.group({
      medUslugaId: [null, Validators.required],
      medUstanovaId: [{ value: null, disabled: true }, Validators.required],
      datum: [null, [Validators.required, notPastDateValidator]],
      vreme: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.masterService.getMyCoveredServices().subscribe({
      next: res => {
        this.loadingUsluge = false;
        if (res.success) {
          this.coveredServices = res.data || [];
        } else {
          this.toster.error(res.message, 'Globos osiguranje');
        }
      },
      error: () => this.loadingUsluge = false,
    });

    this.zakaziForm.get('medUslugaId').valueChanges.subscribe(medUslugaId => {
      this.institutions = [];
      this.zakaziForm.get('medUstanovaId').reset();

      if (!medUslugaId) {
        this.zakaziForm.get('medUstanovaId').disable();
        return;
      }

      this.loadingUstanove = true;
      this.masterService.getInstitutionsForService(medUslugaId).subscribe({
        next: res => {
          this.loadingUstanove = false;
          if (res.success) {
            this.institutions = res.data || [];
            this.zakaziForm.get('medUstanovaId').enable();
          } else {
            this.toster.error(res.message, 'Globos osiguranje');
          }
        },
        error: () => this.loadingUstanove = false,
      });
    });
  }

  get izabranaUsluga(): CoveredService | undefined {
    const id = this.zakaziForm.get('medUslugaId').value;
    return this.coveredServices.find(u => u.medUslugaId === id);
  }

  get izabranaUstanova(): InstitutionForService | undefined {
    const id = this.zakaziForm.get('medUstanovaId').value;
    return this.institutions.find(u => u.medUstanovaId === id);
  }

  get pregledSpreman(): boolean {
    return !!this.izabranaUsluga && !!this.izabranaUstanova && !!this.zakaziForm.get('datum').valid && !!this.zakaziForm.get('vreme').value;
  }

  zakazi(): void {
    if (this.zakaziForm.invalid) {
      this.zakaziForm.markAllAsTouched();
      return;
    }

    const vrednosti = this.zakaziForm.getRawValue();
    this.submitting = true;

    this.masterService.bookAppointment({
      medUslugaId: vrednosti.medUslugaId,
      medUstanovaId: vrednosti.medUstanovaId,
      datumPregleda: vrednosti.datum,
      vreme: vrednosti.vreme,
    }).subscribe({
      next: res => {
        this.submitting = false;
        if (!res.success) {
          this.toster.error(res.message, 'Globos osiguranje');
          return;
        }

        this.toster.success('Pregled je uspešno zakazan.', 'Globos osiguranje');
        this.router.navigate(['/moji-pregledi']);
      },
      error: () => this.submitting = false,
    });
  }
}
