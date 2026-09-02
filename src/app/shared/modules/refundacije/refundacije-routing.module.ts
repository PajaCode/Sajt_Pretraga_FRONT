import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RefundacijeComponent } from 'src/app/components/portali/refundacije/refundacije.component';

const routes: Routes = [
  { path: '', component: RefundacijeComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RefundacijeRoutingModule { }
