import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CurrentUserService } from 'src/app/shared/services/current-user.service';
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
  sending: boolean = false;

  // Prefill iz CurrentUserService (trusted /me) - backend ionako ignorise ove
  // vrednosti iz FormData i uvek ih prepisuje trenutnim korisnikom, ali ih
  // saljemo radi kompatibilnosti sa postojecim EmailManager.SendEmailRefund potpisom.
  ime: string | null = null;
  prezime: string | null = null;
  email: string | null = null;
  telefon: string | null = null;
  brKartice: string | null = null;

  constructor(
    private currentUserService: CurrentUserService,
    private emailService: EmailService,
    private toster: ToastrService,
  ) { }

  ngOnInit(): void {
    this.currentUserService.ensureLoaded().subscribe(user => {
      if (!user) {
        return;
      }

      this.ime = user.ime;
      this.prezime = user.prezime;
      this.email = user.email;
      this.telefon = user.telefon;
      this.brKartice = user.brKartice;
    });
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
    if (this.fileToUpload.length === 0) {
      this.toster.error('Morate izabrati barem jedan fajl');
      return;
    }

    const formData = new FormData();
    this.fileToUpload.forEach((file) => {
      formData.append('files', file, file.name);
    });
    formData.append('brojKartice', this.brKartice || '');
    formData.append('imeKorisnika', this.ime || '');
    formData.append('prezimeKorisnika', this.prezime || '');
    formData.append('emailKorisnika', this.email || '');
    formData.append('brojTelefona', this.telefon || '');

    this.sending = true;
    this.emailService.SendEmailRefund(formData).subscribe({
      next: res => {
        this.sending = false;
        if (res.success) {
          this.toster.success('Uspešno poslat mejl');
          this.clearFiles();
        } else {
          this.toster.error(res.message, 'Globos osiguranje');
        }
      },
      error: () => {
        this.sending = false;
      },
    });
  }

  clearFiles() {
    this.fileToUpload.splice(0);
    this.nazivFajla.splice(0);

    if (this.fileInput && this.fileInput.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
