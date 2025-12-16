import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { ContactApiService } from '@app/core/api/contact/contact-api.service';
import { finalize } from 'rxjs';
import { LoaderComponent } from '@app/shared/components/loader/loader.component';
import { Contact } from '@app/shared/models/contact.model';

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    LoaderComponent
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private contactApi = inject(ContactApiService);
  
  public status = signal<FormStatus>('idle');
  public submitted = signal(false);

  public contactForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    description: ['', [Validators.required, Validators.minLength(20)]]
  });

  public showErrors = computed(() => this.submitted() && this.contactForm.invalid);

  public buttonText = computed(() => {
    if (this.status() === 'loading') {
      return 'Envoi en cours...';
    }
    return 'Envoyer le message';
  });

  onSubmit(): void {
    this.submitted.set(true);

    if (this.contactForm.invalid) {
      return;
    }

    this.status.set('loading');
    const formData = this.contactForm.value as Contact;

    this.contactApi.sendContactForm(formData).pipe(
      finalize(() => {
        // On ne remet pas le status à 'idle' ici pour pouvoir afficher les messages.
      })
    ).subscribe({
      next: () => {
        this.status.set('success');
        this.contactForm.reset();
        this.submitted.set(false);
      },
      error: (err) => {
        console.error("Erreur lors de l'envoi du formulaire", err);
        this.status.set('error');
      }
    });
  }

  get f() {
    return this.contactForm.controls;
  }
}
