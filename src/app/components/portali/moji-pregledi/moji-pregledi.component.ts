import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MasterService } from 'src/app/shared/services/master.service';
import { DocumentListItem, MyAppointment } from 'src/app/shared/models/master';

const STATUS_SEVERITY: { [status: string]: string } = {
  Zakazan: 'info',
  CekaDokumentaciju: 'warning',
  DokumentacijaUObradi: 'warning',
  Zavrsen: 'success',
  DokumentacijaGreska: 'danger',
  Otkazan: 'secondary',
};

const TERMINAL_STATUSES = ['Zavrsen', 'Otkazan'];

@Component({
  selector: 'app-moji-pregledi',
  templateUrl: './moji-pregledi.component.html',
  styleUrls: ['./moji-pregledi.component.scss']
})
export class MojiPreglediComponent implements OnInit {

  loading: boolean = true;
  appointments: MyAppointment[] = [];

  syncing: boolean = false;

  documentsDialogVisible: boolean = false;
  documentsLoading: boolean = false;
  documentsError: string | null = null;
  documents: DocumentListItem[] = [];
  selectedAppointment: MyAppointment | null = null;
  downloadingId: number | null = null;

  constructor(
    private masterService: MasterService,
    private toster: ToastrService,
  ) { }

  ngOnInit(): void {
    this.ucitajPreglede();
  }

  ucitajPreglede(): void {
    this.loading = true;
    this.masterService.getMyAppointments().subscribe({
      next: res => {
        this.loading = false;
        if (res.success) {
          this.appointments = (res.data || []).sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
          this.toster.error(res.message, 'Globos osiguranje');
        }
      },
      error: () => this.loading = false,
    });
  }

  statusSeverity(status: string): string {
    return STATUS_SEVERITY[status] || 'secondary';
  }

  mozeOsvezitiStatus(pregled: MyAppointment): boolean {
    return !TERMINAL_STATUSES.includes(pregled.status);
  }

  osveziStatus(): void {
    this.syncing = true;
    this.masterService.syncDocumentation().subscribe({
      next: res => {
        this.syncing = false;
        if (res.success) {
          this.toster.success('Status dokumentacije je osvežen.', 'Globos osiguranje');
          this.ucitajPreglede();
        } else {
          this.toster.error(res.message, 'Globos osiguranje');
        }
      },
      error: () => this.syncing = false,
    });
  }

  otvoriDokumenta(pregled: MyAppointment): void {
    this.selectedAppointment = pregled;
    this.documentsDialogVisible = true;
    this.documentsLoading = true;
    this.documentsError = null;
    this.documents = [];

    this.masterService.getAppointmentDocuments(pregled.pregledStatusId).subscribe({
      next: res => {
        this.documentsLoading = false;
        if (res.success) {
          this.documents = res.data || [];
        } else {
          this.documentsError = res.message;
        }
      },
      error: () => {
        this.documentsLoading = false;
        this.documentsError = 'Došlo je do greške prilikom učitavanja dokumenata.';
      },
    });
  }

  preuzmiDokument(doc: DocumentListItem): void {
    this.downloadingId = doc.id;
    this.masterService.downloadDocument(doc.id).subscribe({
      next: response => {
        this.downloadingId = null;
        const fileName = this.izvuciFileName(response.headers.get('Content-Disposition')) || doc.nazivFajla || 'dokument';
        const blob = response.body as Blob;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.downloadingId = null;
      },
    });
  }

  private izvuciFileName(contentDisposition: string | null): string | null {
    if (!contentDisposition) {
      return null;
    }

    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(contentDisposition);
    return match ? decodeURIComponent(match[1]) : null;
  }
}
