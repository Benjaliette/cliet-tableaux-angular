import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-ondemand',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent
  ],
  templateUrl: './ondemand.component.html',
  styleUrl: './ondemand.component.scss'
})
export class OndemandComponent implements OnInit {
  
  contactForm!: FormGroup;
  isSubmitted = false;
  fileName: string | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      image: [null]
    });
  }

  get formControls() {
    return this.contactForm.controls;
  }

  onFileChange(event: Event): void {
    const element = event.currentTarget as HTMLInputElement;
    let fileList: FileList | null = element.files;

    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      
      this.contactForm.patchValue({
        image: file
      });
      
      this.fileName = file.name;
    }
  }

  onSubmit(): void {
    this.isSubmitted = true;

    if (this.contactForm.invalid) {
      console.log('Le formulaire contient des erreurs.');
      
      this.contactForm.markAllAsTouched(); 
      return;
    }

    
    console.log('Formulaire soumis avec succès !');
    console.log(this.contactForm.value);

    // TODO:
    // Utiliser un service qui fait un appel HTTP vers le backend
    // ou un service comme EmailJS / Formspree.

    // Après la soumission :
    // this.contactForm.reset();
    // this.fileName = null;
    // this.isSubmitted = false;
  }
}
