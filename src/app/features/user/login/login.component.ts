import { Component } from '@angular/core';

import { LoginFormComponent } from '../../../shared/components/forms/login-form/login-form.component';
import { SignupFormComponent } from '../../../shared/components/forms/signup-form/signup-form.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [LoginFormComponent, SignupFormComponent, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isLoginView = true;

  toggleView(): void {
    this.isLoginView = !this.isLoginView;
  }
}
