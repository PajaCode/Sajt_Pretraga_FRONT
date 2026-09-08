import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { DzoService } from 'src/app/shared/services/dzo.service';
import { CurrentUserService } from 'src/app/shared/services/current-user.service';
import * as moment from 'moment';


@Component({
  selector: 'app-paketi',
  templateUrl: './paketi.component.html',
  styleUrls: ['./paketi.component.scss']
})

export class PaketiComponent implements OnInit {
  skeleton = true;
  JMBG: string;

  loadingPokrica: boolean = true;
  loadingPodPokrica: boolean = true;

  paketiPokrica: any[] = []
  tabelaPodPokrica = false
  paketiPodPokrica: any[] = []
  selectedPaket: any;

  detaljiPolise!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private dzoService: DzoService,
    private currentUserService: CurrentUserService,
    private toster: ToastrService,
  ) {
    this.formGrupe();
  }

  ngOnInit(): void {
    this.getDetaljiPolise();
  }

  formGrupe() {
    this.detaljiPolise = this.fb.group({
      Ime: [{ value: null, disabled: true }],
      Prezime: [{ value: null, disabled: true }],
      BrKartice: [{ value: null, disabled: true }],
      brojPolise: [{ value: null, disabled: true }],
      pocetakOsiguranja: [{ value: null, disabled: true }],
      krajOsiguranja: [{ value: null, disabled: true }],
      datRodjenja: [{ value: null, disabled: true }],
      brTelefona: [{ value: null, disabled: true }],
      firma: [{ value: null, disabled: true }],
    });
  }

  // Sprint 2: identitet/polisa dolaze iz CurrentUserService (trusted MR podaci,
  // vec ucitani preko PurchaseGuard/AuthGuard), ne iz legacy ApiService.getUserDetails.
  // Iskoriscenost po paketima/podpokricima ostaje na postojecem DzoService toku (JMBG).
  getDetaljiPolise() {
    this.currentUserService.ensureLoaded().subscribe(user => {
      if (!user) {
        this.toster.error('Nije moguće učitati podatke o osiguranju.', 'Globos osiguranje');
        return;
      }

      this.JMBG = user.jmbg;
      this.skeleton = false;

      this.detaljiPolise.patchValue({
        Ime: user.ime,
        Prezime: user.prezime,
        BrKartice: user.brKartice,
        brojPolise: user.brPolise,
        pocetakOsiguranja: user.packageActivatedAt ? moment(user.packageActivatedAt).format('DD.MM.YYYY') : null,
        krajOsiguranja: user.packageExpiresAt ? moment(user.packageExpiresAt).format('DD.MM.YYYY') : null,
        datRodjenja: user.datumRodjenja ? moment(user.datumRodjenja).format('DD.MM.YYYY') : null,
        brTelefona: user.telefon,
        // Master self-purchase: korisnik je sam sebi ugovarac osiguranja.
        firma: `${user.ime} ${user.prezime}`,
      });

      if (!this.JMBG) {
        this.loadingPokrica = false;
        return;
      }

      this.dzoService.getIskoriscenostPoPaketima(this.JMBG).subscribe(res => {
        if (res.success) {
          this.loadingPokrica = false;
          this.paketiPokrica = res.resultList;
        }
        else
          this.toster.error(res.message, 'Globos osiguranje');
      });
    });
  }
  // Metoda je zamenjena sa selectProductOnClick metodom (event klik na dugme detalji)
  selectProduct() {

    this.tabelaPodPokrica = true;

    this.dzoService.getIskoriscenostPoPodpokricima(this.JMBG, this.selectedPaket.idPaketa).subscribe(res => {
      if (res.success) {
        this.paketiPodPokrica = res.resultList;
        this.loadingPodPokrica = false;
      }
      else
        this.toster.error(res.message, 'Globos osiguranje');
    });
  }

  formatNumber(value: string): string {
    return parseFloat(value).toFixed(2) + ' €';
  }

  selectProductOnClick(idPaketa, nazivPokrice) {

    this.tabelaPodPokrica = true;

    this.dzoService.getIskoriscenostPoPodpokricima(this.JMBG, idPaketa).subscribe(res => {
      if (res.success) {
        this.paketiPodPokrica = res.resultList;
        this.loadingPodPokrica = false;
        this.selectedPaket = nazivPokrice;

      }
      else
        this.toster.error(res.message, 'Globos osiguranje');
    });
  }

}
