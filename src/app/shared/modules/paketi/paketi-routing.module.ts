import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaketiComponent } from 'src/app/components/portali/paketi/paketi.component';

const routes: Routes = [
  { path: '', component: PaketiComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaketiRoutingModule { }
