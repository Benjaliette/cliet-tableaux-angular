import { Component, computed, EventEmitter, inject, input, Output, Signal, ViewChild } from '@angular/core';
import { Painting } from '../../models/painting.model';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';
import { ConfirmationModalComponent } from '../modals/confirmation-modal/confirmation-modal.component';
import { ImageTransformationService } from '@app/core/services/image-transformation.service';

@Component({
  selector: 'app-painting-card',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage, ConfirmationModalComponent],
  templateUrl: './painting-card.component.html',
  styleUrl: './painting-card.component.scss'
})
export class PaintingCardComponent {
  painting = input.required<Painting>();
  private imageTransformation = inject(ImageTransformationService);

  @Output() delete = new EventEmitter<string>();
  @ViewChild(ConfirmationModalComponent) modal!: ConfirmationModalComponent;
  
  public readonly formattedDimensions: Signal<string> = computed(() => {
    const p = this.painting();

    if (p && p.dimensions && p.dimensions.width && p.dimensions.height) {
      return `${p.dimensions.width}x${p.dimensions.height} cm`;
    }

    return '';
  });

  readonly thumbnailUrl = computed(() =>
    this.imageTransformation.getThumbnailUrl(this.painting()?.imagePublicId)
  );

  private authService = inject(AuthService);
  isAdmin = this.authService.currentUser()?.admin;

  onDeleteRequest(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.modal.open()
  }

  confirmDelete(): void {
    this.delete.emit(this.painting().id);
  }
}
