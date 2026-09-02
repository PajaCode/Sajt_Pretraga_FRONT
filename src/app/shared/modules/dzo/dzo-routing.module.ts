import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DzoComponent } from 'src/app/components/portali/dzo/dzo.component';

const routes: Routes = [
  { path: '', component: DzoComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DzoRoutingModule { }
