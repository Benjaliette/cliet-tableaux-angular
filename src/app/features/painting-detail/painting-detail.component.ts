import { Component, OnInit, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { PaintingsStore } from '../../core/store/paintings.store';
import { Painting } from '../../shared/models/painting.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { PaintingsApiService } from '@app/core/api/paintings/paintings-api.service';
import { finalize } from 'rxjs';
import { ImageTransformationService } from '@app/core/services/image-transformation.service';
import { LoaderComponent } from '@app/shared/components/loader/loader.component';

@Component({
  selector: 'app-painting-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, NgOptimizedImage, LoaderComponent],
  templateUrl: './painting-detail.component.html',
  styleUrl: './painting-detail.component.scss'
})
export class PaintingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(PaintingsStore);
  private paintingsApi = inject(PaintingsApiService);
  private imageTransformation = inject(ImageTransformationService);
  public imageAspectRatio = signal<number | null>(null);

  public painting: WritableSignal<Painting | undefined> = signal(undefined);
  public isLoading: WritableSignal<boolean> = signal(true);
  public error: WritableSignal<string | null> = signal(null);
  public isImageLoaded: WritableSignal<boolean> = signal(false);

  private placeholderTransforms = 'w_30,q_auto:low,e_blur:2000,f_auto';
  private finalImageTransforms = 'w_1200,q_auto,f_auto';

  readonly placeholderUrl = computed(() =>
    this.imageTransformation.getPlaceholderUrl(this.painting()?.imagePublicId)
  );

  readonly finalImageUrl = computed(() =>
    this.imageTransformation.getFullImageUrl(this.painting()?.imagePublicId)
  );

    constructor() {
    effect((onCleanup) => {
      const url = this.finalImageUrl();

      if (!url) {
        return;
      }

      this.isImageLoaded.set(false);
      this.imageAspectRatio.set(null);

      const img = new Image();

      const handleLoad = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        this.imageAspectRatio.set(ratio);
      };

      const handleError = () => {
        console.error("Impossible de pré-charger l'image pour obtenir le ratio :", url);
        this.imageAspectRatio.set(16 / 9);
      };

      img.onload = handleLoad;
      img.onerror = handleError;
      img.src = url;

      onCleanup(() => {
        img.onload = null;
        img.onerror = null;
      });
    });
  }

  ngOnInit(): void {
    const paintingId = this.route.snapshot.paramMap.get('id');
    if (!paintingId) {
      console.error('Aucun ID de peinture fourni');
      this.router.navigate(['/not-found']);
      return;
    }
    
    this.loadPainting(paintingId);
  }

  onImageLoad(): void {
    this.isImageLoaded.set(true);
  }

  private loadPainting(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.painting.set(undefined);

    this.paintingsApi.getPaintingById(id).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (paintingData) => {
        this.painting.set(paintingData);
      },
      error: (err) => {
        console.error('Erreur lors de la récupération de la peinture', err);
        if (err.status === 404) {
          this.error.set('Cette œuvre n\'existe pas.');
        } else {
          this.error.set('Une erreur technique est survenue.');
        }
      }
    });
  }
}
