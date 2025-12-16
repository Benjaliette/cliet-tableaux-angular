import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../button/button.component';
import { matchValidator } from '@shared/validators/custom-validators';
import { AuthService } from '@app/core/auth/auth.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-signup-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent],
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss', '../form-styles.scss']
})
export class SignupFormComponent {
  signupForm: FormGroup;
  isSubmitted = false;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  error: string | null = null

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      firstName: ['', []],
      lastName: ['', []],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, {
      validators: matchValidator('password', 'confirmPassword')
    });
  }

  get firstName() { return this.signupForm.get('firstName'); }
  get lastName() { return this.signupForm.get('lastName'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }
  get confirmPassword() { return this.signupForm.get('confirmPassword'); }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.signupForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.error = null;
    this.isSubmitted = true
    
    const { firstName, lastName, email, password } = this.signupForm.value;

    this.authService.register({ firstName, lastName, email, password }).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = 'Email ou mot de passe incorrect.';
        console.error(err);
      }
    });
  }
}
