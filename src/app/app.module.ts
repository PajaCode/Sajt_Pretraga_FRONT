// moduli
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { JwtInterceptor, JwtModule } from '@auth0/angular-jwt';
import { DatePipe } from '@angular/common'
import { NgbAlertModule, NgbDatepickerModule, NgbDateStruct, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxBootstrapIconsModule, allIcons } from 'ngx-bootstrap-icons';
import { JsonPipe } from '@angular/common';
import { CalendarModule } from 'primeng/calendar';
import { environment } from 'src/enviroments/environment';


// pipes
import { MedUstanovaPipe } from './shared/pipes/medUstanove.pipe';

//guards
import { AuthGuard } from './shared/guards/auth.guard';

//interceptors
import { ApiErrorInterceptor } from './shared/interceptors/api-error.interceptor';

//ngx
import { ToastrModule } from 'ngx-toastr';
import { NgxSpinnerModule } from 'ngx-spinner';

//primeng
import { PrimengModule } from './primeng.module';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';


// komponente
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/portali/home/home.component';
import { LoginRegisterComponent } from './components/login-register/login-register.component';
import { ConfirmMailComponent } from './components/confirm-mail/confirm-mail.component';
import { DzoComponent } from './components/portali/dzo/dzo.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ProfilComponent } from './components/profil/profil.component';
import { FooterComponent } from './components/footer/footer.component';
import { PaketiComponent } from './components/portali/paketi/paketi.component';
import { FormaComponent } from './components/portali/forma/forma.component';
import { FormularZaLeadoveComponent } from './components/portali/formular-za-leadove/formular-za-leadove.component';
import { RefundacijeComponent } from './components/portali/refundacije/refundacije.component';
import { KupovinaPaketaComponent } from './components/portali/kupovina-paketa/kupovina-paketa.component';

export function tokenGetter() {
  return localStorage.getItem('user-token') || null;
}

@NgModule({
  declarations: [
    AppComponent,
    MedUstanovaPipe,
    HeaderComponent,
    HomeComponent,
    LoginRegisterComponent,
    ConfirmMailComponent,
    DzoComponent,
    ResetPasswordComponent,
    ProfilComponent,
    FooterComponent,
    PaketiComponent,
    FormaComponent,
    FormularZaLeadoveComponent,
    RefundacijeComponent,
    KupovinaPaketaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ToastrModule.forRoot({
      positionClass: "toast-bottom-right",
      closeButton: true,
      progressBar: true,
      progressAnimation: "increasing",
      timeOut: 3000,
      preventDuplicates: true
    }),
    NgxSpinnerModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        // allowedDomains matches hostname[:port] only (no path) - derived from the
        // active baseApiUrl so it stays correct whichever backend target is uncommented
        // in environment.ts, instead of a hardcoded list that never matched.
        allowedDomains: [new URL(environment.baseApiUrl).host],
      },
    }),
    PrimengModule,
    NgbDatepickerModule,
    NgbAlertModule,
    FormsModule,
    JsonPipe,
    NgbModule,
    NgxBootstrapIconsModule.pick(allIcons),
    ButtonModule,
    InputTextareaModule,
    DynamicDialogModule,
    ToastModule,
    CalendarModule,
  ],
  providers: [AuthGuard,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ApiErrorInterceptor, multi: true }
    , DatePipe, MessageService]
  , bootstrap: [AppComponent]
})
export class AppModule { }
