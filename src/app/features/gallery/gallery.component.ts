import { Component, OnInit, inject } from '@angular/core';
import { PaintingsStore } from '../../core/store/paintings.store';
import { PaintingCardComponent } from '../../shared/components/painting-card/painting-card.component';

import { ToastService } from '@app/core/services/toast.service';
import { AuthService } from '@app/core/auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [PaintingCardComponent, RouterLink],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit {
  private store = inject(PaintingsStore);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  isAdmin = this.authService.currentUser()?.admin;
  paintings = this.store.paintings;
  loading = this.store.loading;

  ngOnInit(): void {
    this.store.loadPaintings();
  }

  handleDelete(paintingId: string): void {
    this.store.deletePainting(paintingId).subscribe({
      next: () => {
        this.toastService.showSuccess('L\'œuvre a été supprimée avec succès.');
      },
      error: (err) => {
        console.error('Failed to delete painting', err);
        this.toastService.showError('Échec de la suppression de l\'œuvre.');
      }
    });
  }
}
