import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from 'src/app/shared/services/api.service';
import { AuthService } from 'src/app/shared/services/auth.service';

@Component({
  selector: 'app-formular-za-leadove',
  templateUrl: './formular-za-leadove.component.html',
  styleUrls: ['./formular-za-leadove.component.scss']
})
export class FormularZaLeadoveComponent implements OnInit {
  isLogged = false;
  skeleton = true;

  problem!: FormGroup
  saglasnost!: FormControl;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private apiService: ApiService,
    private toster: ToastrService,
    private authService: AuthService
  ) {
    this.problem = this.fb.group({
      imeKompanije: [''],
      maticniBroj: ['', [Validators.required, Validators.minLength(13), Validators.pattern('^[0-9]+$')]],
      adresa: [''],
      brojZaposlenih: [''],
      kontaktOsoba: [''],
      kontaktEmail: ['', [Validators.required, Validators.email]],
      kontaktTelefon: ['', [Validators.required, Validators.pattern("^06[0-9]{8,9}$")]],
      pitanje: [''],
      saglasnost: [false] 
    });
  }
  
  ngOnInit(): void {
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  unosFormularaLeader(){
    const imeKompanije = this.problem.controls['imeKompanije'].value
    const maticniBroj = this.problem.controls['maticniBroj'].value
    const adresa = this.problem.controls['adresa'].value
    const brojZaposlenih = this.problem.controls['brojZaposlenih'].value
    const kontaktOsoba = this.problem.controls['kontaktOsoba'].value
    const kontaktEmail = this.problem.controls['kontaktEmail'].value
    const kontaktTelefon = this.problem.controls['kontaktTelefon'].value
    const pitanje = this.problem.controls['pitanje'].value
    const saglasnost = this.problem.controls['saglasnost'].value

    const formData = new FormData();
    formData.append('imeKompanije', imeKompanije)
    formData.append('maticniBroj', maticniBroj)
    formData.append('adresa', adresa)
    formData.append('brojZaposlenih', brojZaposlenih)
    formData.append('kontaktEmail', kontaktEmail)
    formData.append('kontaktOsoba', kontaktOsoba)
    formData.append('kontaktTelefon', kontaktTelefon)
    formData.append('pitanje', pitanje)
    formData.append('saglasnost', saglasnost)


    if(!imeKompanije || !adresa || !kontaktEmail || !kontaktTelefon || !kontaktOsoba){
      this.toster.error('Morate popuniti sva polja');
      return
    }

    if(!saglasnost){
      this.toster.error('Morate označiti saglanost radi kontaktiranja');
      return
    }
    
    this.apiService.slanjeFormularaLeadera(formData).subscribe(res => {
      if(res = "Uspesno"){
        this.toster.success('Formular je uspešno poslat');
      }else{
        this.toster.error('Došlo je do greške');
      }
    })
  }

  ponisti(){
    this.problem.patchValue({
      imeKompanije: null,
      maticniBroj: null,
      adresa: null,
      brojZaposlenih: null,
      kontaktEmail: null,
      kontaktOsoba: null,
      kontaktTelefon: null,
      pitanje: null,
      saglasnost: null
    })
  }
}
