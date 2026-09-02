import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';
import { EmailService } from 'src/app/shared/services/email.service';

@Component({
  selector: 'app-confirm-mail',
  templateUrl: './confirm-mail.component.html',
  styleUrls: ['./confirm-mail.component.scss']
})
export class ConfirmMailComponent implements OnInit {

  decodedToken: any;
  tokenExpired: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private emailService: EmailService,
    private jwtHelper: JwtHelperService,
    private authService: AuthService,
    private toster: ToastrService
  ) {
    this.route.params.subscribe(params => {
      const token = params['token'];
      if (token) {
        try {
          this.decodedToken = this.jwtHelper.decodeToken(token);

          if (this.jwtHelper.isTokenExpired(this.route.snapshot.params['token'])) {
            this.tokenExpired = true;
          }

        } catch (error) {
          console.error('Error decoding token: ', error);
        }
      } else {
        console.error('Token not provided.');
      }
    });
  }

  ngOnInit(): void {

    if (!this.decodedToken) {
      return;
    }

    if (!this.decodedToken.Aktivan) {
      // this.toster.warning('Email nije potvrdjen.', 'Globos osiguranje');
      return;
    }

    if (this.jwtHelper.isTokenExpired(this.route.snapshot.params['token'])) {
      return;
    }

    // metoda za updejtovanje mejla u bazi
    this.emailService.updateConfirmEmail(this.decodedToken.Email).subscribe(
      (res: any) => {
        if (res.success) {
          this.authService.deleteToken('email-token');
          this.toster.success(res.message, 'Globos osiguranje');
        }
        else {
          this.toster.error(res.message, 'Globos osiguranje');
        }
      },
    );
  }

  // metoda za ponovno slanje mejla
  ponoviMejl() {

    const emailAgain = {
      emailRecipient: this.decodedToken.Email,
      tip: 1
    }

    this.emailService.sendEmail(emailAgain).subscribe(
      res => {
        if (res.success) {
          this.toster.success(res.message, 'Globos osiguranje');
        } else {
          this.toster.error(res.message, 'Globos osiguranje');
          this.router.navigate(['login']);
        }
      },
    );

    this.authService.deleteToken('email-token');
  }
}
