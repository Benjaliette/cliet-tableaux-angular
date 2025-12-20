import { Component, OnInit, inject, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CloudinaryUploadService } from '../../core/services/cloudinary-upload.service';
import { finalize } from 'rxjs';
import { PaintingsStore } from '@app/core/store/paintings.store';
import { Painting } from '@app/shared/models/painting.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ImageTransformationService } from '@app/core/services/image-transformation.service';
import { PaintingsApiService } from '@app/core/api/paintings/paintings-api.service';

@Component({
  selector: 'app-edit-painting',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './edit-painting.component.html',
  styleUrls: ['./edit-painting.component.scss']
})
export class EditPaintingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cloudinaryService = inject(CloudinaryUploadService);
  private paintingApi = inject(PaintingsApiService);
  private imageTransformation = inject(ImageTransformationService);
  
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  uploading = signal(false);
  uploadError = signal<string | null>(null);
  isDragging = signal(false);
  previewThumbnailUrl = signal<string | null>(null);
  paintingId = signal<string | null>(null);
  pageError = signal<string | null>(null);

  paintingForm = this.fb.group({
    title: ['', Validators.required],
    height: [null as number | null, [Validators.min(1)]],
    width: [null as number | null, [Validators.min(1)]],
    technique: ['Huile sur toile', Validators.required],
    imagePublicId: ['', Validators.required],
    sell: [false, Validators.required],
    price: [{ value: null as number | null, disabled: true }, [Validators.required, Validators.min(0.01)]]
  });

  constructor() {
    this.paintingForm.get('sell')?.valueChanges
      .pipe(takeUntilDestroyed())
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

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.pageError.set("Impossible de trouver l'ID du tableau dans l'URL.");
      return;
    }
    this.paintingId.set(id);

    this.paintingApi.getPaintingById(id).subscribe({
      next: (painting: Painting | undefined) => {
        if (!painting) {
          this.pageError.set("Ce tableau n'existe pas ou n'a pas pu être chargé.");
          return;
        }
        
        this.paintingForm.patchValue({
          title: painting.title,
          height: painting.dimensions.height,
          width: painting.dimensions.width,
          technique: painting.technique,
          imagePublicId: painting.imagePublicId,
          sell: painting.sell,
          price: painting.price
        });

        const thumbUrl = this.imageTransformation.getThumbnailUrl(painting.imagePublicId);
        this.previewThumbnailUrl.set(thumbUrl);
      },
      error: (err: any) => this.pageError.set("Une erreur est survenue lors du chargement de l'œuvre.")
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

    const currentId = this.paintingId();
    if (!currentId) {
      this.pageError.set("L'ID du tableau est manquant, impossible de mettre à jour.");
      return;
    }
    
    const formValue = this.paintingForm.getRawValue();

    const updatedPainting: Partial<Painting> = {
      title: formValue.title!,
      dimensions: {
        height: formValue.height!,
        width: formValue.width!
      },
      technique: formValue.technique,
      imagePublicId: formValue.imagePublicId!,
      sell: formValue.sell!,
      price: formValue.sell ? formValue.price : null,
      currency: 'EUR'
    };

    this.paintingApi.updatePainting(currentId, updatedPainting).subscribe({
      next: () => {
        this.router.navigate(['/mon-compte']);
      },
      error: (err: any) => {
        this.pageError.set("Erreur lors de la mise à jour de l'œuvre.");
        console.error('Erreur finale dans le composant:', err);
      }
    });
  }

  cancel(): void {
    this.location.back();
  }
}
