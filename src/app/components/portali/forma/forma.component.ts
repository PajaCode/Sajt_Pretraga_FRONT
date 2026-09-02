import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/shared/services/api.service';
import { DzoService } from 'src/app/shared/services/dzo.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { CustomDateParserFormatter } from 'src/app/shared/dateFormating/customDateParserFormatter';
import { retry } from 'rxjs';



@Component({
  selector: 'app-forma',
  templateUrl: './forma.component.html',
  styleUrls: ['./forma.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
  ]
})


export class FormaComponent implements OnInit {

  fileToUpload: File | null = null;
  nazivFajla: string;
  loggedUser: any;
  brTelefona: string;
  mejl: string;
  isLogged = true;
  skeleton = true;
  JMBG: string;
  datumRodjenja: any;
  gradOpstina: string;
  izabranaUstanova: string;
  datumPregleda: any;
  vremePregleda: any;

  loadingPokrica: boolean = true;
  loadingIstorija: boolean = true;

  paketiPokrica: any[] = []
  tabelaIstorija = false
  paketiPodPokrica: any[] = []
  istorija: any[] = []
  selectedPaket: any;
  medUstanoveGradoviOpstine: any[] = [];
  medUstanove: any[] = [];

  detaljiLogovan!: FormGroup;
  detaljiNijeLogovan!: FormGroup;
  problem!: FormGroup
  saglasnost!: FormControl;

  currentTime: any;
  dateNow: any;
  idUstanove: any;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private dzoService: DzoService,
    private apiService: ApiService,
    private toster: ToastrService,
    private authService: AuthService,
    private datePipe: DatePipe,
  ) {
    this.currentTimeDisplay();
    this.timeInput();
    this.formaLogovan();
    this.formaNijeLogovan();
    this.formProblemGrupe();
    this.prikaziMedUstanoveGradoviOpstine();

  }

  ngOnInit(): void {
    this.isLogged = this.isLoggedIn();

    if (this.isLogged) {
      this.getDetaljiPolise();
    }

    this.toster.info('Poštovani/a, povratna informacija u vezi zakazanog pregleda se dobija najkasnije 48h od trenutka prijema mejla. Ukoliko želite povratnu informaciju ranije, najbolje bi bilo da zakažete pregled putom broja telefona sa vaše kartice.', 'Globos osiguranje', {
      disableTimeOut: true,
      closeButton: true,
    })
  }

  checkInputTime() {
    if (this.problem.get('vreme').value != null) {
      this.vremePregleda =
        this.problem.get('vreme').value.getHours().toString().padStart(2, "0") + ":" + this.problem.get('vreme').value.getMinutes().toString().padStart(2, "0");
      return this.vremePregleda;
    }
    this.vremePregleda = null;
    return this.vremePregleda;
  }

  timeInput() {
    this.dateNow = new Date();
    this.dateNow.setMinutes(0);

    return this.dateNow;
  }

  //kad je user logovan
  formaLogovan() {
    this.detaljiLogovan = this.fb.group({
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

  //kad user nije logovan
  formaNijeLogovan() {
    this.detaljiNijeLogovan = this.fb.group({
      nIme: [{ value: null, disabled: false }],
      nPrezime: [{ value: null, disabled: false }],
      nMejl: [{ value: null, disabled: false }],
      nTelefon: [{ value: null, disabled: false }],
      nBrojKartice: [{ value: null, disabled: false }],
      nDatumRodjenja: [{ value: null, disabled: false }],
    });
  }

  formProblemGrupe() {
    this.problem = this.fb.group({
      opisProblema: [{ value: null, disabled: false }],
      vrstaPregleda: [{ value: null, disabled: false }],
      izabranaUstanova: [{ value: null, disabled: false }],
      gradOpstina: [{ value: null, disabled: false }],
      vreme: [{ value: this.dateNow, disabled: false }],
      datumPregleda: [{ value: null, disabled: false }],
    });
  }

  getDetaljiPolise() {

    if (this.isLoggedIn) {
      this.apiService.getUserDetails().subscribe(res => {
        if (res.success) {
          this.loggedUser = res.resultList[0];
          this.JMBG = res.resultList[0].jmbg;
          this.brTelefona = res.resultList[0].brTelefona;
          this.dzoService.getOsnovniPodaci(this.JMBG).subscribe(res => {
            if (res.success) {
              this.skeleton = false;
              this.datumRodjenja = res.resultList[0].datumRodjenja;
              this.detaljiLogovan.patchValue({
                Ime: res.resultList[0].ime,
                Prezime: res.resultList[0].prezime,
                BrKartice: res.resultList[0].brKartice,
                brojPolise: res.resultList[0].brPolise,
                pocetakOsiguranja: res.resultList[0].pocetakOsiguranja.substring(0, 10).split('-').reverse().join('.') + '.',
                krajOsiguranja: res.resultList[0].krajOsiguranja.substring(0, 10).split('-').reverse().join('.') + '.',
                datRodjenja: moment(res.resultList[0].datumRodjenja).format('DD.MM.YYYY'),
                brTelefona: this.brTelefona,
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

  }


  formatNumber(value: string): string {
    return parseFloat(value).toFixed(2) + ' €';
  }


  isLoggedIn() {
    return this.authService.isLoggedIn();
  }


  insertUputaLogged() {
    const idPortala = this.loggedUser.id;
    const ime = this.detaljiLogovan.controls['Ime'].value;
    const prezime = this.detaljiLogovan.controls['Prezime'].value;
    const telefon = this.loggedUser.brTelefona
    const mejl = this.loggedUser.email
    const brKartice = this.detaljiLogovan.controls['BrKartice'].value;
    const opisProblema = this.problem.controls['opisProblema'].value;
    //const izabranaUstanova = this.problem.controls['izabranaUstanova'].value
    //const gradOpstina = this.problem.controls['gradOpstina'].value
    const vreme = this.problem.controls['vreme'].value;
    if (vreme != null) {
      this.vremePregleda =
        vreme.getHours().toString().padStart(2, "0") + ":" + vreme.getMinutes().toString().padStart(2, "0");
    }
    const vrstaPregleda = this.problem.controls['vrstaPregleda'].value;
    const datumPregleda = this.problem.controls['datumPregleda'].value;
    if (datumPregleda != null) {
      this.datumPregleda = new Date(datumPregleda.year, datumPregleda.month - 1, datumPregleda.day);
    }
    
    const formData = new FormData();
    formData.append('file', this.fileToUpload);
    formData.append('IdPortal', idPortala)
    formData.append('OpisProblema', opisProblema)
    formData.append('TrazenaUstanova', this.izabranaUstanova)
    formData.append('Ime', ime)
    formData.append('Prezime', prezime)
    formData.append('BrTelefona', telefon)
    formData.append('BrKartice', brKartice)
    formData.append('Email', mejl)
    formData.append('Saglasnost', "true")
    formData.append('GradOpstina', this.gradOpstina)
    formData.append('Vreme', this.vremePregleda)
    formData.append('IdUstanove',this.idUstanove);

    if (datumPregleda != null) {
      formData.append('datumPregleda', moment(this.datumPregleda).format('YYYY-MM-DD'))
    } else {
      formData.append('datumPregleda', '')
    }
    if (this.datumRodjenja != null) {
      formData.append('DatumRodjenja', moment(this.datumRodjenja).format('YYYY-MM-DD'))
    } else {
      formData.append('DatumRodjenja', '')
    }
    formData.append('vrstaPregleda', vrstaPregleda)

    if (!opisProblema || !this.izabranaUstanova || !this.gradOpstina || !vreme || !vrstaPregleda || !datumPregleda) {
      this.toster.error('Morate popuniti sva polja');
      return
    }

    if (this.vremePregleda < this.currentTime && this.datumPregleda <= Date.parse(this.todayDatePlusOne())) {
      this.toster.error('Vreme pregleda mora biti najmanje 24h u odnosu na trenutno vreme');
      return
    }

    if (!this.saglasnost) {
      this.toster.error('Morate označiti čekboks');
      return
    }

    this.apiService.insertUputa(formData).subscribe(res => {
      if (res) {
        this.toster.success('Uput je uspešno poslat');

        setTimeout(() => {
          this.ponisti();
        }, 500);

      } else {
        this.toster.error('Došlo je do greške');
      }
    })



  }


  insertUputaNot() {
    const ime = this.detaljiNijeLogovan.controls['nIme'].value;
    const prezime = this.detaljiNijeLogovan.controls['nPrezime'].value;
    const brKartice = this.detaljiNijeLogovan.controls['nBrojKartice'].value;
    const mejl = this.detaljiNijeLogovan.controls['nMejl'].value;
    const telefon = this.detaljiNijeLogovan.controls['nTelefon'].value;
    const opisProblema = this.problem.controls['opisProblema'].value;
    //const izabranaUstanova = this.problem.controls['izabranaUstanova'].value;
    //const gradOpstina = this.problem.controls['gradOpstina'].value
    const vreme = this.problem.controls['vreme'].value;
    if (vreme != null) {
      this.vremePregleda =
        vreme.getHours().toString().padStart(2, "0") + ":" + vreme.getMinutes().toString().padStart(2, "0");
    }
    const datumPregleda = this.problem.controls['datumPregleda'].value;
    const vrstaPregleda = this.problem.controls['vrstaPregleda'].value
    const datumRodj = this.detaljiNijeLogovan.controls['nDatumRodjenja'].value;
    let ngbDatumModel;
    if (datumRodj != null) {
      ngbDatumModel = new Date(datumRodj.year, datumRodj.month - 1, datumRodj.day);
    }
    if (datumPregleda != null) {
      this.datumPregleda = new Date(datumPregleda.year, datumPregleda.month - 1, datumPregleda.day);
    }
    const formData = new FormData();
    formData.append('file', this.fileToUpload);
    formData.append('IdPortal', '0')
    formData.append('OpisProblema', opisProblema)
    formData.append('TrazenaUstanova', this.izabranaUstanova)
    formData.append('Ime', ime)
    formData.append('Prezime', prezime)
    formData.append('BrTelefona', telefon)
    formData.append('BrKartice', brKartice)
    formData.append('Email', mejl)
    formData.append('Saglasnost', "true")
    formData.append('GradOpstina', this.gradOpstina)
    formData.append('Vreme', this.vremePregleda)
    formData.append('IdUstanove',this.idUstanove);
    if (datumRodj != null) {
      formData.append('DatumRodjenja', moment(ngbDatumModel).format('YYYY-MM-DD'))
    } else {
      formData.append('DatumRodjenja', '')
    }
    formData.append('vrstaPregleda', vrstaPregleda)
    if (datumPregleda != null) {
      formData.append('datumPregleda', moment(this.datumPregleda).format('YYYY-MM-DD'))
    } else {
      formData.append('datumPregleda', '')
    }

    if (!ime || !prezime || !brKartice || !mejl || !telefon || !datumRodj || !opisProblema
      || !this.izabranaUstanova || !this.gradOpstina || !vreme || !vrstaPregleda || !datumPregleda) {

      this.toster.error('Morate popuniti sva polja');
      return
    }
    if (this.vremePregleda < this.currentTime && this.datumPregleda <= Date.parse(this.todayDatePlusOne())) {
      this.toster.error('Vreme pregleda mora biti najmanje 24h u odnosu na trenutno vreme');
      return
    }
    
    if (!this.saglasnost) {
      this.toster.error('Morate označiti čekboks');
      return
    }

    this.apiService.insertUputa(formData).subscribe(res => {
      if (res) {
        this.toster.success('Uput je uspešno poslat');

        setTimeout(() => {
          this.ponisti();
        }, 500);

      } else {
        this.toster.error('Došlo je do greške');
      }
    })

  }


  ponisti() {

    this.detaljiNijeLogovan.patchValue({
      nIme: null,
      nPrezime: null,
      nBrojKartice: null,
      nMejl: null,
      nTelefon: null,
      nDatumRodjenja: null
    });

    this.problem.patchValue({
      opisProblema: null,
      izabranaUstanova: null,
      gradOpstina: null,
      vreme: this.dateNow,
      vrstaPregleda: null,
      datumPregleda: null
    });

    this.saglasnost = null,
      this.fileToUpload = null;
    this.nazivFajla = '';

  }




  istorijaUputa() {
    this.tabelaIstorija = true;

    this.apiService.istorijaUput().subscribe(res => {
      if (res.success) {
        this.istorija = res.resultList;
        this.loadingIstorija = false;
      }
      else {
        this.toster.error('Došlo je do greške');
      }

    });
  }

  formatDateIstorija(datumPregleda: any) {

    if (datumPregleda != null) {
      let date = moment(datumPregleda).format('DD.MM.YYYY');
      return date;
    }
    return null;
  }

  getCurrentYear(): any {
    var today = new Date();
    var yyyy = today.getFullYear();
    return yyyy;
  }

  getCurrentMonth(): any {
    var today = new Date();
    const month = today.getUTCMonth() + 1;

    return month;
  }

  getCurrentDay(): any {
    var today = new Date();
    //day must be in future (greater than today)
    const day = today.getUTCDate() + 1;

    return day;

  }


  handleFileInput(event: Event) {

    const target = event.target as HTMLInputElement;
    const files: FileList | null = target.files;
    if (files && files.length > 0) {
      const file: File = files[0];
      this.fileToUpload = file;
      this.nazivFajla = file.name
    }
  }

  prikaziMedUstanoveGradoviOpstine() {
    this.dzoService.getMedUstanoveGradoviOpstine().subscribe(res => {
      if (res.success) {
        this.medUstanoveGradoviOpstine = res.resultList;
      } else {
        this.toster.error('Greška');
      }
    })

  }

  updateMedUstanove(gradOpstina: any) {
    this.gradOpstina = gradOpstina.value.gradOpstina;

    this.dzoService.getMedUstanoveWithFormat(gradOpstina.value.grad, gradOpstina.value.opstinaGradska).subscribe(res => {
      if (res.success) {
        this.medUstanove = res.resultList;
      } else {
        this.toster.error('Greška');
      }
    });
  }

  updateMedUstanovaAtribut(ustanova: any) {

    this.izabranaUstanova = ustanova.value.nazivAdresa;
    this.idUstanove = ustanova.value.nasId;
  }

  todayDatePlusOne() {
    //+1 dan za datum pregleda
    var today = new Date();
    var dd = String(today.getDate() + 1).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    var todayString = yyyy + '-' + mm + '-' + dd;

    return todayString;
  }

  formatedDateInput() {
    if (this.problem.get('datumPregleda').value != null) {
      var date = this.problem.get('datumPregleda').value;
      var dateFromPicker = new Date(date.year, date.month - 1, date.day)
      var formatedDate = moment(dateFromPicker).format('YYYY-MM-DD');

      return formatedDate;
    }
    return null;
  }


  currentTimeDisplay() {
    var d = new Date();
    d.getHours();
    d.getMinutes();
    d.getSeconds();

    var hours = d.getHours();
    var minutes = d.getMinutes();
    var seconds = d.getSeconds();

    this.currentTime = hours.toString().padStart(2, "0") + ":" + minutes.toString().padStart(2, "0");
    return this.currentTime;
  }
}

