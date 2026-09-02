import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KupovinaPaketaComponent } from 'src/app/components/portali/kupovina-paketa/kupovina-paketa.component';

const routes: Routes = [
  { path: '', component: KupovinaPaketaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KupovinaPaketaRoutingModule { }
