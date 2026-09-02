import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/shared/services/api.service';
import { DzoService } from 'src/app/shared/services/dzo.service';
import * as moment from 'moment';


@Component({
  selector: 'app-paketi',
  templateUrl: './paketi.component.html',
  styleUrls: ['./paketi.component.scss']
})

export class PaketiComponent implements OnInit {
  skeleton = true;
  JMBG: string;
  brojTelefona: string;

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
    private apiService: ApiService,
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


  getDetaljiPolise() {
    this.apiService.getUserDetails().subscribe(res => {
      if (res.success) {
        this.JMBG = res.resultList[0].jmbg;
        this.brojTelefona = res.resultList[0].brTelefona;
        this.dzoService.getOsnovniPodaci(this.JMBG).subscribe(res => {
          if (res.success) {
            this.skeleton = false;

            this.detaljiPolise.patchValue({
              Ime: res.resultList[0].ime,
              Prezime: res.resultList[0].prezime,
              BrKartice: res.resultList[0].brKartice,
              brojPolise: res.resultList[0].brPolise,
              pocetakOsiguranja: res.resultList[0].pocetakOsiguranja.substring(0, 10).split('-').reverse().join('.') + '.',
              krajOsiguranja: res.resultList[0].krajOsiguranja.substring(0, 10).split('-').reverse().join('.') + '.',
              datRodjenja: moment(res.resultList[0].datumRodjenja).format('DD.MM.YYYY'),
              brTelefona: this.brojTelefona,
              firma: res.resultList[0].ugovarac,
            });
          }
          if (!res.success)
            this.toster.error(res.message, 'Globos osiguranje');
        });

        this.dzoService.getIskoriscenostPoPaketima(this.JMBG).subscribe(res => {
          if (res.success) {
            this.loadingPokrica = false;
            this.paketiPokrica = res.resultList;
          }
          else
            this.toster.error(res.message, 'Globos osiguranje');
        });
      }
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
