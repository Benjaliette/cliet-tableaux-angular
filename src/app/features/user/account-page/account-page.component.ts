
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';
import { ToastService } from '@app/core/services/toast.service';
import { PaintingsStore } from '@app/core/store/paintings.store';
import { PaintingCardListComponent } from '@app/shared/components/painting-card-list/painting-card-list.component';

@Component({
  selector: 'app-account-page',
  imports: [RouterLink, PaintingCardListComponent],
  templateUrl: './account-page.component.html',
  styleUrl: './account-page.component.scss'
})
export class AccountPageComponent {
  private authService = inject(AuthService);
  private store = inject(PaintingsStore);
  private toastService = inject(ToastService);

  paintings = this.store.paintings;
  loading = this.store.loading;

  ngOnInit(): void {
    this.store.loadPaintings();
  }

  public readonly currentUser = this.authService.currentUser;

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
