import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/shared/services/api.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DzoService } from 'src/app/shared/services/dzo.service';
import { EmailService } from 'src/app/shared/services/email.service';

@Component({
  selector: 'app-refundacije',
  templateUrl: './refundacije.component.html',
  styleUrls: ['./refundacije.component.scss']
})
export class RefundacijeComponent implements OnInit {

  @ViewChild('fileInput', { static: false }) fileInput: ElementRef<HTMLInputElement>;

  fileToUpload: File[] = [];
  nazivFajla: string[] = [];
  refundacijeGroup!: FormGroup;
  isLogged: any;

  skeleton: any;
  detaljiPolise!: FormGroup;
  loggedUser: any;
  JMBG: any;
  brTelefona: any;
  datumRodjenja: any;
  imeKorisnika: any;
  prezimeKorisnika: any;
  emailKorisnika: any;
  brKartice: any;





  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private dzoService: DzoService,
    private apiService: ApiService,
    private toster: ToastrService,
    private authService: AuthService,
    private emailService: EmailService,

  ) {
    this.formaLogovan();
    this.initForm();

  }


  ngOnInit(): void {

    this.isLogged = this.isLoggedIn();

    if (this.isLogged) {
      this.getDetaljiPolise();
    }

  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }


  formaLogovan() {
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

    if (this.isLoggedIn) {
      this.apiService.getUserDetails().subscribe(res => {
        if (res.success) {
          this.loggedUser = res.resultList[0];
          this.imeKorisnika = res.resultList[0].ime;
          this.prezimeKorisnika = res.resultList[0].prezime;
          this.emailKorisnika = res.resultList[0].email;
          this.JMBG = res.resultList[0].jmbg;
          this.brTelefona = res.resultList[0].brTelefona;
          this.brKartice = res.resultList[0].brKartice;
          this.dzoService.getOsnovniPodaci(this.JMBG).subscribe(res => {
            if (res.success) {
              this.skeleton = false;
              this.datumRodjenja = res.resultList[0].datumRodjenja;
              this.detaljiPolise.patchValue({
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
        }
      });
    }

  }

  removeFile(f: any) {
    for (let index = 0; index < this.nazivFajla.length; index++) {
      const element = this.nazivFajla[index];
      if (element == f) {
        this.nazivFajla.splice(index, 1);
        this.fileToUpload.splice(index, 1);
      }
      // Reset the file input if all files are removed
      if (this.nazivFajla.length === 0) {
        this.fileInput.nativeElement.value = '';
      }
    }

  }

  handleFileInput(event: Event) {

    const target = event.target as HTMLInputElement;
    const files: FileList | null = target.files;
    for (let index = 0; index < files.length; index++) {
      if (files && files.length > 0) {
        const file: File = files[index];
        if (!this.nazivFajla.includes(file.name)) {
          this.fileToUpload.push(file);
          this.nazivFajla.push(file.name);
        }
      }
    }
  }

  sendMail() {

    const formData = new FormData();

    this.fileToUpload.forEach((file, index) => {
      formData.append('files', file, file.name);
    });
    formData.append('brojKartice', this.brKartice);
    formData.append('imeKorisnika', this.imeKorisnika);
    formData.append('prezimeKorisnika', this.prezimeKorisnika);
    formData.append('emailKorisnika', this.emailKorisnika);
    formData.append('brojTelefona', this.brTelefona);

    if (this.fileToUpload.length > 0) {
      this.emailService.SendEmailRefund(formData).subscribe(res => {
        if (res.success) {
          this.toster.success('Uspešno poslat mejl');

          this.clearFiles();
        }
        else {
          this.toster.error('Došlo je do greške');
        }
      })
    } else {
      this.toster.error('Morate izabrati barem jedan fajl');
    }

  }

  initForm() {
    this.refundacijeGroup = this.fb.group({
      fileUpload: [{ value: null, disabled: true }]
    })
  }

  clearFiles() {

    this.fileToUpload.splice(0);
    this.nazivFajla.splice(0);

    // Reset the file input element
    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }

    this.refundacijeGroup.patchValue({
      fileUpload: null
    });


  }

}



