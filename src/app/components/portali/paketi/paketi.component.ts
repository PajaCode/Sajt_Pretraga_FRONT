import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/shared/services/current-user.service';
import { MasterService } from 'src/app/shared/services/master.service';
import { PackageCoverage, PackageSubCoverage, PackageUsageHistoryItem } from 'src/app/shared/models/master';
import * as moment from 'moment';


@Component({
  selector: 'app-paketi',
  templateUrl: './paketi.component.html',
  styleUrls: ['./paketi.component.scss']
})

export class PaketiComponent implements OnInit {
  skeleton = true;

  loadingPokrica: boolean = true;
  loadingPodPokrica: boolean = true;

  paketiPokrica: any[] = []
  tabelaPodPokrica = false
  paketiPodPokrica: any[] = []
  selectedPaket: any;

  istorijaKoriscenja: PackageUsageHistoryItem[] = [];
  loadingIstorija: boolean = true;

  detaljiPolise!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private masterService: MasterService,
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

  // FIX G3: identitet/polisa dolaze iz CurrentUserService (trusted MR podaci), a
  // iskoriscenost/rezervacija/preostalo/istorija dolaze iz GET /api/Master/packages/{id}
  // (MR_Paket/MR_PregledStatus tok), umesto starog legacy DzoService/JMBG toka koji nikad
  // nije video preglede zakazane kroz novi Master flow.
  getDetaljiPolise() {
    this.currentUserService.ensureLoaded().subscribe(user => {
      if (!user) {
        this.toster.error('Nije moguće učitati podatke o osiguranju.', 'Globos osiguranje');
        return;
      }

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

      if (!user.paketId) {
        this.loadingPokrica = false;
        this.loadingIstorija = false;
        return;
      }

      this.masterService.getPackageDetails(user.paketId).subscribe(res => {
        if (res.success) {
          this.loadingPokrica = false;
          this.loadingIstorija = false;
          this.paketiPokrica = res.data.glavnaPokrica.map(pokrice => this.mapPokrice(pokrice));
          this.istorijaKoriscenja = res.data.istorijaKoriscenja ?? [];
        }
        else {
          this.loadingPokrica = false;
          this.loadingIstorija = false;
          this.toster.error(res.message, 'Globos osiguranje');
        }
      });
    });
  }

  private mapPokrice(pokrice: PackageCoverage) {
    return {
      idPaketa: pokrice.id,
      nazivPokrice: pokrice.nazivPokrice,
      iskorisceno: pokrice.iskorisceno ?? 0,
      rezervisano: pokrice.rezervisano ?? 0,
      preostalo: pokrice.sumaOsiguranja == null ? 'Bez limita' : (pokrice.preostalo ?? 0),
      suma_osiguranja: pokrice.sumaOsiguranja ?? 0,
      ucesceOsiguranika: pokrice.ucesceProcenat ?? 0,
      podpokrica: pokrice.podpokrica,
    };
  }

  // Samo za progress-bar prikaz (used/reserved/remaining) - ne dira izracunatu
  // vrednost pokrica, vec samo pretvara vec izracunate iznose u procenat sirine.
  pct(part: number, total: number): number {
    if (!total) return 0;
    return Math.max(0, Math.min(100, (part / total) * 100));
  }

  private vrstaLimitaLabel(vrstaLimita: string): string {
    switch (vrstaLimita) {
      case 'BrojOdlazaka': return 'Broj odlazaka';
      case 'BezLimita': return 'Bez limita';
      default: return 'Iznos';
    }
  }

  selectProductOnClick(pokrice: any, nazivPokrice: string) {
    this.tabelaPodPokrica = true;
    this.selectedPaket = nazivPokrice;
    this.loadingPodPokrica = true;

    this.paketiPodPokrica = (pokrice.podpokrica as PackageSubCoverage[]).map(pod => ({
      paket: nazivPokrice,
      suma_Osiguranja: pod.sumaOsiguranja ?? 0,
      nazivPodpokrica: pod.nazivPodpokrica,
      vrsta_Limita: this.vrstaLimitaLabel(pod.vrstaLimita),
      limit: pod.limitVrednost,
      iskorisceno: pod.iskorisceno ?? 0,
      rezervisano: pod.rezervisano ?? 0,
      preostalo: pod.sumaOsiguranja == null ? 'Bez limita' : (pod.preostalo ?? 0),
      usluge: pod.usluge,
    }));
    this.loadingPodPokrica = false;
  }

  formatNumber(value: string): string {
    return parseFloat(value).toFixed(2) + ' €';
  }

}
