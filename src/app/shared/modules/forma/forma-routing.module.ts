import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormaComponent } from 'src/app/components/portali/forma/forma.component';

const routes: Routes = [
  { path: '', component: FormaComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FormaRoutingModule { }
