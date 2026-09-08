import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MojiPreglediComponent } from 'src/app/components/portali/moji-pregledi/moji-pregledi.component';

const routes: Routes = [
  { path: '', component: MojiPreglediComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MojiPreglediRoutingModule { }
