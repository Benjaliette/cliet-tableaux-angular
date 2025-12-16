// src/app/pages/add-painting-page/add-painting-page.component.ts
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule,Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CloudinaryUploadService } from '../../core/services/cloudinary-upload.service';
import { finalize } from 'rxjs';
import { PaintingsStore } from '@app/core/store/paintings.store';
import { Painting } from '@app/shared/models/painting.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImageTransformationService } from '@app/core/services/image-transformation.service';

@Component({
  selector: 'app-add-painting',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule], // Ne pas oublier ReactiveFormsModule !
  templateUrl: './add-painting.component.html',
  styleUrls: ['./add-painting.component.scss']
})
export class AddPaintingComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cloudinaryService = inject(CloudinaryUploadService);
  private paintingStore = inject(PaintingsStore);
  private imageTransformation = inject(ImageTransformationService);
  private location = inject(Location);

  uploading = signal(false);
  uploadError = signal<string | null>(null);
  isDragging = signal(false);
  previewThumbnailUrl = signal<string | null>(null);

  paintingForm = this.fb.group({
    title: ['', Validators.required],
    height: [null, [Validators.min(1)]],
    width: [null, [Validators.min(1)]],
    technique: ['Huile sur toile', Validators.required],
    imagePublicId: ['', Validators.required],
    sell: [false, Validators.required],
    price: [{ value: null, disabled: true }, [Validators.required, Validators.min(0.01)]]
  });

  constructor() {
    this.paintingForm.get('sell')?.valueChanges
      .pipe(
        takeUntilDestroyed()
      )
      .subscribe(isForSale => {
        const priceControl = this.paintingForm.get('price');
        if (isForSale) {
          priceControl?.enable();
        } else {
          priceControl?.disable();
          priceControl?.reset();
        }
      });
  }

  resetImage(): void {
    this.paintingForm.get('imagePublicId')?.reset();
    this.previewThumbnailUrl.set(null);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.uploadFile(input.files[0]);
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
      this.uploadFile(event.dataTransfer.files[0]);
    }
  }

  uploadFile(file: File): void {
    this.uploading.set(true);
    this.uploadError.set(null);

    this.cloudinaryService.uploadImage(file).pipe(
      finalize(() => this.uploading.set(false))
    ).subscribe({
      next: (response: string | null) => {
        this.paintingForm.patchValue({ imagePublicId: response });
        const thumbUrl = this.imageTransformation.getThumbnailUrl(response);
        this.previewThumbnailUrl.set(thumbUrl);
      },
      error: (err) => {
        console.error('Upload failed:', err);
        this.uploadError.set('L\'upload a échoué. Veuillez réessayer.');
      }
    });
  }

  onSubmit(): void {
    if (this.paintingForm.invalid) {
      return;
    }
    
        const formValue = this.paintingForm.getRawValue();

    const newPainting: Omit<Painting, 'id' | 'description' | 'creationDate' | 'thumbnailUrl' | 'category'> = {
      title: formValue.title!,
      dimensions: {
        height: formValue.height,
        width: formValue.width
      },
      technique: formValue.technique,
      imagePublicId: formValue.imagePublicId!,
      sell: formValue.sell!,
      price: formValue.sell ? formValue.price ? formValue.price * 100 : null : null,
      currency: 'EUR'
    };

    this.paintingStore.createPainting(newPainting as Painting).subscribe({
      next: () => {
        this.router.navigate(['/gallery']);
      },
      error: (err) => {
        console.error('Erreur finale dans le composant:', err);
      }
    });
  }

  cancel(): void {
    this.location.back();
  }
}
