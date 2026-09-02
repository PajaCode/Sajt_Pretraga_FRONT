import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ResetPasswordComponent } from 'src/app/components/reset-password/reset-password.component';
import { ResetPassGuard } from '../../guards/reset-pass.guard';

const routes: Routes = [
  { path: '', component: ResetPasswordComponent },
  { path: ':token', component: ResetPasswordComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResetPasswordRoutingModule { }
