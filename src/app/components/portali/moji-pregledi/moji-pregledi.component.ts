import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { MasterService } from 'src/app/shared/services/master.service';
import { MyAppointment } from 'src/app/shared/models/master';

const STATUS_SEVERITY: { [status: string]: string } = {
  Zakazan: 'info',
  CekaDokumentaciju: 'warning',
  DokumentacijaUObradi: 'warning',
  Zavrsen: 'success',
  DokumentacijaGreska: 'danger',
  Otkazan: 'secondary',
};

@Component({
  selector: 'app-moji-pregledi',
  templateUrl: './moji-pregledi.component.html',
  styleUrls: ['./moji-pregledi.component.scss']
})
export class MojiPreglediComponent implements OnInit {

  loading: boolean = true;
  appointments: MyAppointment[] = [];

  constructor(
    private masterService: MasterService,
    private toster: ToastrService,
  ) { }

  ngOnInit(): void {
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
}
