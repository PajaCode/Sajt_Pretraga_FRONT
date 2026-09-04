import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { ActivePackageGuard } from './shared/guards/active-package.guard';
import { ResetPassGuard } from './shared/guards/reset-pass.guard';
import { RootGuard } from './shared/guards/root.guard';
import { GuestGuard } from './shared/guards/guest.guard';
import { PurchaseGuard } from './shared/guards/purchase.guard';

const routes: Routes = [
  // Session-aware: odluka (/login, /home, /kupovina-paketa) zavisi od stvarnog
  // /api/Master/me stanja - vidi RootGuard. Nema statickog redirectTo.
  { path: '', pathMatch: 'full', canActivate: [RootGuard], children: [] },
  {
    path: '',
    children: [
      { path: 'home', loadChildren: () => import('./shared/modules/home/home.module').then((m) => m.HomeModule) },
      { path: 'profil', loadChildren: () => import('./shared/modules/profil/profil.module').then((m) => m.ProfilModule), canActivate: [AuthGuard] },
      { path: 'paketi', loadChildren: () => import('./shared/modules/paketi/paketi.module').then(m => m.PaketiModule), canActivate: [AuthGuard, ActivePackageGuard] },
      { path: 'kupovina-paketa', loadChildren: () => import('./shared/modules/kupovina-paketa/kupovina-paketa.module').then(m => m.KupovinaPaketaModule), canActivate: [AuthGuard, PurchaseGuard] },
      { path: 'dzo', loadChildren: () => import('./shared/modules/dzo/dzo.module').then((m) => m.DzoModule), canActivate: [AuthGuard, ActivePackageGuard] },
      { path: 'kontaktdzo', loadChildren: () => import('./shared/modules/forma/forma.module').then((m) => m.FormaModule ), canActivate: [AuthGuard, ActivePackageGuard] },
      { path: 'formaZaLeadove', loadChildren: () => import('./shared/modules/forma-za-leadove/forma-za-leadove.module').then((m) => m.FormaZaLeadoveModule )},
      { path: 'refundacije', loadChildren: () => import('./shared/modules/refundacije/refundacije.module').then((m) => m.RefundacijeModule), canActivate: [AuthGuard, ActivePackageGuard] }

    ]
  },
  { path: 'login', loadChildren: () => import('./shared/modules/login/login.module').then((m) => m.LoginModule), canActivate: [GuestGuard] },
  { path: 'register', loadChildren: () => import('./shared/modules/register/register.module').then((m) => m.RegisterModule), canActivate: [GuestGuard] },
  { path: 'confirm-mail', loadChildren: () => import('./shared/modules/confirm-mail/confirm-mail.module').then((m) => m.ConfirmMailModule) },
  { path: 'reset-password', loadChildren: () => import('./shared/modules/reset-password/reset-password.module').then((m) => m.ResetPasswordModule), canActivate: [ResetPassGuard] },
  { path: '**', redirectTo: '' },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
