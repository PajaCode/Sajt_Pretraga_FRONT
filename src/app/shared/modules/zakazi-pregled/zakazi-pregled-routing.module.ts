import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ZakaziPregledComponent } from 'src/app/components/portali/zakazi-pregled/zakazi-pregled.component';

const routes: Routes = [
  { path: '', component: ZakaziPregledComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ZakaziPregledRoutingModule { }
