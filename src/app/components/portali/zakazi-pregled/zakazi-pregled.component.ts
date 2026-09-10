import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { MasterService } from 'src/app/shared/services/master.service';
import { CoveredService, InstitutionForService, WorkingHour } from 'src/app/shared/models/master';

const DATE_FORMAT: string = 'DD.MM.YYYY';

// p-calendar (datum) drzi vrednost kao Date objekat kad je uspesno parsiran/izabran,
// ili kao "sirov" string dok korisnik jos kuca (keepInvalid). Ako je unet tacno 8 cifara
// (sa ili bez tacaka), normalizujemo u dd.MM.yyyy string radi validacije/prikaza.
function normalizeDateString(value: string): string | null {
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length !== 8) {
    return null;
  }
  return digitsOnly.substring(0, 2) + '.' + digitsOnly.substring(2, 4) + '.' + digitsOnly.substring(4, 8);
}

function toMoment(value: any): moment.Moment | null {
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return moment(value);
  }
  if (typeof value === 'string') {
    const normalized = normalizeDateString(value);
    if (!normalized) {
      return null;
    }
    const parsed = moment(normalized, DATE_FORMAT, true);
    return parsed.isValid() ? parsed : null;
  }
  return null;
}

// Ne prijavljuje gresku dok korisnik jos kuca (manje od 8 cifara) - validacija je odlozena
// dok unos nije kompletan (8 cifara / 10 karaktera) ili dok polje ne izgubi fokus.
function validDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return null;
  }
  if (typeof value === 'string') {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length < 8) {
      return null;
    }
    return toMoment(value) ? null : { invalidDate: true };
  }
  return null;
}

// Datum ne sme biti u proslosti - poredi se kao pravi datum (moment), ne kao string.
function notPastDateValidator(control: AbstractControl): ValidationErrors | null {
  const parsed = toMoment(control.value);
  if (!parsed) {
    return null;
  }

  return parsed.startOf('day').isBefore(moment().startOf('day')) ? { pastDate: true } : null;
}

// Isti princip kao normalizeDateString - "1200" (4 cifre, bez ':') se pretvara u "12:00".
function normalizeTimeString(value: string): string | null {
  const digitsOnly = value.replace(/\D/g, '');
  if (digitsOnly.length !== 4) {
    return null;
  }
  return digitsOnly.substring(0, 2) + ':' + digitsOnly.substring(2, 4);
}

// Ne prijavljuje gresku dok korisnik jos kuca (manje od 4 cifre) - validacija je odlozena
// dok unos nije kompletan (4 cifre / HH:mm) ili dok polje ne izgubi fokus.
function validTimeValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null;
  }
  if (value instanceof Date) {
    return null;
  }
  if (typeof value === 'string') {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length < 4) {
      return null;
    }
    const normalized = normalizeTimeString(value);
    if (!normalized) {
      return { invalidTime: true };
    }
    const [sati, minuti] = normalized.split(':').map(Number);
    return sati >= 0 && sati <= 23 && minuti >= 0 && minuti <= 59 ? null : { invalidTime: true };
  }
  return null;
}

@Component({
  selector: 'app-zakazi-pregled',
  templateUrl: './zakazi-pregled.component.html',
  styleUrls: ['./zakazi-pregled.component.scss']
})
export class ZakaziPregledComponent implements OnInit {

  loadingUsluge: boolean = true;
  coveredServices: CoveredService[] = [];

  loadingUstanove: boolean = false;
  institutions: InstitutionForService[] = [];

  // FIX F - DZO komponenta se reuse-uje kao institution-picker modal umesto
  // p-dropdown-a; institutions je vec filtrirano po izabranoj usluzi od backend-a.
  institutionModalVisible: boolean = false;

  loadingRadnoVreme: boolean = false;
  workingHours: WorkingHour[] = [];

  submitting: boolean = false;

  zakaziForm: FormGroup;

  // minDate za p-calendar - sprecava izbor proslog datuma kroz popup. Backend/manuelna
  // validacija (notPastDateValidator) ostaje kao stvarna zastita bez obzira na ovo.
  minDate: Date = new Date(new Date().setHours(0, 0, 0, 0));

  constructor(
    private fb: FormBuilder,
    private masterService: MasterService,
    private router: Router,
    private toster: ToastrService,
  ) {
    this.zakaziForm = this.fb.group({
      medUslugaId: [null, Validators.required],
      medUstanovaId: [null, Validators.required],
      datum: [null, [Validators.required, validDateValidator, notPastDateValidator]],
      vreme: [null, [Validators.required, validTimeValidator]],
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
        return;
      }

      this.loadingUstanove = true;
      this.masterService.getInstitutionsForService(medUslugaId).subscribe({
        next: res => {
          this.loadingUstanove = false;
          if (res.success) {
            this.institutions = res.data || [];
          } else {
            this.toster.error(res.message, 'Globos osiguranje');
          }
        },
        error: () => this.loadingUstanove = false,
      });
    });

    // Radno vreme dolazi iskljucivo sa backend-a (MR_MedUstanovaRadnoVreme) -
    // "08-20" se nikad ne hardkoduje u Angular-u.
    this.zakaziForm.get('medUstanovaId').valueChanges.subscribe(medUstanovaId => {
      this.workingHours = [];

      if (!medUstanovaId) {
        return;
      }

      this.loadingRadnoVreme = true;
      this.masterService.getInstitutionWorkingHours(medUstanovaId).subscribe({
        next: res => {
          this.loadingRadnoVreme = false;
          if (res.success) {
            this.workingHours = res.data || [];
          } else {
            this.toster.error(res.message, 'Globos osiguranje');
          }
        },
        error: () => this.loadingRadnoVreme = false,
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

  // Prikaz u readonly polju: "Naziv, Adresa, Grad".
  get izabranaUstanovaPrikaz(): string {
    const ustanova = this.izabranaUstanova;
    if (!ustanova) {
      return 'Nije izabrana zdravstvena ustanova';
    }
    return [ustanova.nazivUstanove, ustanova.adresa, ustanova.grad].filter(deo => !!deo).join(', ');
  }

  openInstitutionModal(): void {
    if (!this.zakaziForm.get('medUslugaId').value) {
      return;
    }
    this.institutionModalVisible = true;
  }

  onInstitutionSelected(institution: InstitutionForService): void {
    this.zakaziForm.get('medUstanovaId').setValue(institution.medUstanovaId);
    this.zakaziForm.get('medUstanovaId').markAsTouched();
    this.institutionModalVisible = false;
  }

  private get parsedDatum(): moment.Moment | null {
    return toMoment(this.zakaziForm.get('datum').value);
  }

  get datumPrikaz(): string | null {
    const parsed = this.parsedDatum;
    return parsed ? parsed.format(DATE_FORMAT) : null;
  }

  // Manuelni unos ("10092026" ili "10.09.2026") se normalizuje na dd.MM.yyyy tek kad
  // polje izgubi fokus (blur/Tab) - dok korisnik kuca, p-calendar sam drzi sirov string
  // (keepInvalid) bez preranog formatiranja/greske.
  onDatumBlur(): void {
    const control = this.zakaziForm.get('datum');
    const value = control.value;

    if (typeof value === 'string' && value.length > 0) {
      const normalized = normalizeDateString(value);
      if (normalized) {
        const parsed = moment(normalized, DATE_FORMAT, true);
        control.setValue(parsed.isValid() ? parsed.toDate() : normalized);
      }
    }

    control.markAsTouched();
  }

  get radnoVremeZaIzabranDan(): WorkingHour | undefined {
    const parsed = this.parsedDatum;
    if (!parsed) {
      return undefined;
    }

    // moment isoWeekday(): 1=Ponedeljak..7=Nedelja - isti ISO 8601 kao DanUNedelji u bazi.
    const isoDan = parsed.isoWeekday();
    return this.workingHours.find(w => w.danUNedelji === isoDan);
  }

  // Prikaz radnog vremena za izabranu ustanovu/dan - "Radno vreme za izabrani dan: 08:00 - 20:00".
  get radnoVremePrikaz(): string | null {
    if (!this.izabranaUstanova || this.loadingRadnoVreme) {
      return null;
    }

    if (!this.parsedDatum) {
      return null;
    }

    const danRadnoVreme = this.radnoVremeZaIzabranDan;
    if (!danRadnoVreme) {
      return 'Medicinska ustanova ne radi izabranog dana.';
    }

    return 'Radno vreme za izabrani dan: ' + danRadnoVreme.vremeOd.substring(0, 5) + ' - ' + danRadnoVreme.vremeDo.substring(0, 5);
  }

  // p-calendar [timeOnly] drzi vreme kao Date objekat - konvertuje se u "HH:mm" string
  // radi poredjenja sa radnim vremenom i slanja ka backend-u. Nepotpun/nevalidan sirov
  // unos (npr. "12", "2460") namerno vraca null - poslovna provera radnog vremena ceka
  // kompletan validan format, isto kao datum.
  get vremeString(): string | null {
    const vreme = this.zakaziForm.get('vreme').value;
    if (!vreme) {
      return null;
    }
    if (vreme instanceof Date) {
      return moment(vreme).format('HH:mm');
    }
    if (typeof vreme === 'string') {
      return /^([01]\d|2[0-3]):[0-5]\d$/.test(vreme) ? vreme : null;
    }
    return null;
  }

  // Manuelni unos ("1200" ili "12:00") se normalizuje na HH:mm tek kad polje izgubi fokus
  // (blur/Tab) - dok korisnik kuca, p-calendar sam drzi sirov string (keepInvalid).
  onVremeBlur(): void {
    const control = this.zakaziForm.get('vreme');
    const value = control.value;

    if (typeof value === 'string' && value.length > 0) {
      const normalized = normalizeTimeString(value);
      if (normalized) {
        const [sati, minuti] = normalized.split(':').map(Number);
        if (sati <= 23 && minuti <= 59) {
          const date = new Date();
          date.setHours(sati, minuti, 0, 0);
          control.setValue(date);
        } else {
          control.setValue(normalized);
        }
      }
    }

    control.markAsTouched();
  }

  // Vreme se ne validira kao Reactive Forms validator jer zavisi od async ucitanog
  // radnog vremena ustanove - racuna se ovde i koristi i za prikaz greske i za
  // gating submit dugmeta. Backend ponavlja istu proveru (MR_CreateAppointmentRequest).
  get vremeGreska(): string | null {
    const vreme = this.vremeString;
    const parsedDatum = this.parsedDatum;

    if (!vreme || !parsedDatum) {
      return null;
    }

    const danRadnoVreme = this.radnoVremeZaIzabranDan;
    if (!danRadnoVreme) {
      return 'Medicinska ustanova ne radi izabranog dana.';
    }

    const vremeOd = danRadnoVreme.vremeOd.substring(0, 5);
    const vremeDo = danRadnoVreme.vremeDo.substring(0, 5);

    if (vreme < vremeOd || vreme >= vremeDo) {
      return 'Izabrano vreme nije u radnom vremenu medicinske ustanove.';
    }

    if (parsedDatum.isSame(moment(), 'day')) {
      const [sati, minuti] = vreme.split(':').map(Number);
      const izabranoVreme = moment().hour(sati).minute(minuti).second(0).millisecond(0);

      if (izabranoVreme.isSameOrBefore(moment())) {
        return 'Izabrano vreme je već prošlo.';
      }
    }

    return null;
  }

  get pregledSpreman(): boolean {
    return !!this.izabranaUsluga
      && !!this.izabranaUstanova
      && this.zakaziForm.get('datum').valid
      && !!this.vremeString
      && !this.vremeGreska;
  }

  zakazi(): void {
    if (this.zakaziForm.invalid || this.vremeGreska) {
      this.zakaziForm.markAllAsTouched();
      if (this.vremeGreska) {
        this.toster.error(this.vremeGreska, 'Globos osiguranje');
      }
      return;
    }

    const vrednosti = this.zakaziForm.getRawValue();
    this.submitting = true;

    this.masterService.bookAppointment({
      medUslugaId: vrednosti.medUslugaId,
      medUstanovaId: vrednosti.medUstanovaId,
      datumPregleda: this.parsedDatum.format('YYYY-MM-DD'),
      vreme: this.vremeString,
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
