import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormularZaLeadoveComponent } from 'src/app/components/portali/formular-za-leadove/formular-za-leadove.component';

const routes: Routes = [
  { path: '', component: FormularZaLeadoveComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormaZaLeadoveRoutingModule { }
