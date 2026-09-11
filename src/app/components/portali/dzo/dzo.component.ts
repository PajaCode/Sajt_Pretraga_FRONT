import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LazyLoadEvent, PrimeNGConfig } from 'primeng/api';
import { Table } from 'primeng/table';
import { LoginRegisterComponent } from 'src/app/components/login-register/login-register.component';
import { MedUstanova } from 'src/app/shared/models/medUstanova';
import { InstitutionForService } from 'src/app/shared/models/master';
import { DzoService } from 'src/app/shared/services/dzo.service';

@Component({
  selector: 'app-dzo',
  templateUrl: './dzo.component.html',
  styleUrls: ['./dzo.component.scss'],
})
export class DzoComponent implements OnInit, OnChanges {

  // FIX F - institution-picker modal (Zakazi pregled) reuse-uje ovu istu komponentu
  // umesto duplirane tabele/search-a. selectionMode=true: institutions dolaze kao
  // @Input (vec filtrirane po usluzi od strane backend-a), bez DZO_GetMedUstanove poziva.
  @Input() selectionMode: boolean = false;
  @Input() institutions: InstitutionForService[] = [];
  @Output() institutionSelected = new EventEmitter<InstitutionForService>();

  medicinskeUstanove: any[] = [];

  loadingTable: boolean;
  loadingPDF: boolean;

  gradFilter: string = '';
  nazivFilter: string = '';
  adresaFilter: string = '';
  originalMedicinskeUstanove: any[] = [];

  constructor(
    private dzoService: DzoService,
    private toster: ToastrService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.selectionMode) {
      this.loadingTable = false;
      this.setInstitutions(this.institutions);
      return;
    }

    this.getTable();

    this.loadingTable = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectionMode && changes['institutions'] && !changes['institutions'].firstChange) {
      this.setInstitutions(this.institutions);
    }
  }

  private setInstitutions(list: InstitutionForService[]): void {
    this.originalMedicinskeUstanove = (list || []).map(i => ({
      medUstanovaId: i.medUstanovaId,
      naziv: i.nazivUstanove,
      grad: i.grad || '',
      adresa: i.adresa || '',
      cena: i.cena,
      valuta: i.valuta,
    }));
    this.gradFilter = '';
    this.nazivFilter = '';
    this.adresaFilter = '';
    this.medicinskeUstanove = [...this.originalMedicinskeUstanove];
  }

  selectInstitution(row: any): void {
    this.institutionSelected.emit({
      medUstanovaId: row.medUstanovaId,
      nazivUstanove: row.naziv,
      grad: row.grad,
      adresa: row.adresa,
      cena: row.cena,
      valuta: row.valuta,
    });
  }

  getTable() {
    this.dzoService.getMedUstanove().subscribe((res: any) => {
      if (res.success) {
        this.originalMedicinskeUstanove = res.resultList;
        this.medicinskeUstanove = [...this.originalMedicinskeUstanove];
        this.loadingTable = false;
      } else {
        this.toster.error(res.message, 'Globos osiguranje');
      }
    });
  }

  getTest() {
    this.dzoService.test().subscribe(response => {
      console.log('Odgovor:', response);
    }, error => {
      console.error('Greška:', error);
    });
  }


  applyCombinedFilter() {
    const filters = {
      grad: this.gradFilter.toLowerCase(),
      naziv: this.nazivFilter.toLowerCase(),
      adresa: this.adresaFilter.toLowerCase()
    };

    this.medicinskeUstanove = this.originalMedicinskeUstanove.filter((medicinskaUstanova: any) => {
      return Object.keys(filters).every(key => {
        return medicinskaUstanova[key].toLowerCase().includes(filters[key]);
      });
    });
  }

  savePDF(): void {
    this.loadingPDF = true;
    this.dzoService.getMedUstanovePDF().subscribe(
      (response: Blob) => {
        const filename = 'spisakMedicinskihUstanova.pdf';
        const blobURL = URL.createObjectURL(response);

        const anchor = document.createElement('a');
        anchor.href = blobURL;
        anchor.download = filename;

        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        this.loadingPDF = false;
      },
      (error: any) => {
        this.loadingPDF = false;
        this.toster.error(error.message, 'Globos osiguranje');
      }
    );
  }
}
