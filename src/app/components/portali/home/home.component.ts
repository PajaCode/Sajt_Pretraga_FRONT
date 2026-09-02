import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  selectedImageSrc: string;

  images: any[];
  skeleton = true;

  constructor(private spinner: NgxSpinnerService, private http: HttpClient) { }

  ngOnInit(): void {
    setTimeout(() => {
      this.spinner.hide();
    }, 500);

    this.http.get<any[]>('assets/images/carousel-images.json').subscribe((data) => {
      this.images = data.map((item) => ({
        itemImageSrc: `${item.link}`,
        thumbnailImageSrc: `${item.link}`,
        alt: item.alt,
        title: item.title
      }));

      this.skeleton = false;
      this.selectedImageSrc = this.images[0].itemImageSrc;

    });
  }

  updateBackground(event) {
    this.selectedImageSrc = this.images[event].itemImageSrc;
  }
}
