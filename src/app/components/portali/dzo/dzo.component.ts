import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { LazyLoadEvent, PrimeNGConfig } from 'primeng/api';
import { Table } from 'primeng/table';
import { LoginRegisterComponent } from 'src/app/components/login-register/login-register.component';
import { MedUstanova } from 'src/app/shared/models/medUstanova';
import { DzoService } from 'src/app/shared/services/dzo.service';

@Component({
  selector: 'app-dzo',
  templateUrl: './dzo.component.html',
  styleUrls: ['./dzo.component.scss'],
})
export class DzoComponent implements OnInit {

  medicinskeUstanove: MedUstanova[] = [];

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

    this.getTable();

    this.loadingTable = true;
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
    //this.loadingPDF = true;
    // this.dzoService.getMedUstanovePDF().subscribe(
    //   (response: Blob) => {
    //     const filename = 'spisakMedicinskihUstanova.pdf';
    //     const blobURL = URL.createObjectURL(response);

    //     const anchor = document.createElement('a');
    //     anchor.href = blobURL;
    //     anchor.download = filename;

    //     anchor.style.display = 'none';
    //     document.body.appendChild(anchor);
    //     anchor.click();
    //     document.body.removeChild(anchor);
    //     this.loadingPDF = false;
    //   },
    //   (error: any) => {
    //     this.toster.error(error.message, 'Globos osiguranje');
    //   }
    // );
    // this.router.navigateByUrl('https://servisiapi.globos.rs/api/DZO/DZO_ExportMedUstanovePDF');
    window.open('https://servisiapi.globos.rs/api/DZO/DZO_ExportMedUstanovePDF', '_blank');
  }
}
