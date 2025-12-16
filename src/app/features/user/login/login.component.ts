import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from '../../../shared/components/forms/login-form/login-form.component';
import { SignupFormComponent } from '../../../shared/components/forms/signup-form/signup-form.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, LoginFormComponent, SignupFormComponent, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  isLoginView = true;

  toggleView(): void {
    this.isLoginView = !this.isLoginView;
  }
}
