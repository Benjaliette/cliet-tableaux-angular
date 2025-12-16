import { computed, inject, Injectable, signal } from '@angular/core';
import { Painting } from '../../shared/models/painting.model';
import { PaintingsApiService } from '../api/paintings/paintings-api.service';
import { catchError, tap, throwError } from 'rxjs';

export interface PaintingsState {
  paintings: Painting[];
  loading: boolean;
  error: string | null;
}

const initialState: PaintingsState = {
  paintings: [],
  loading: false,
  error: null,
};

@Injectable({
  providedIn: 'root',
})
export class PaintingsStore {
  private paintingsApi = inject(PaintingsApiService);

  private readonly state = signal(initialState);

  public readonly paintings = computed(() => this.state().paintings);
  public readonly loading = computed(() => this.state().loading);
  public readonly error = computed(() => this.state().error);

  loadPaintings() {
    this.state.update((state) => ({ ...state, loading: true }));

    this.paintingsApi.getPaintings().subscribe({
      next: (paintings) => {
        this.state.update((state) => ({
          ...state,
          paintings,
          loading: false,
        }));
      },
      error: (err) => {
        this.state.update((state) => ({
          ...state,
          error: 'Failed to load paintings',
          loading: false,
        }));
      },
    });
  }

  getPaintingById(id: string) {
    return computed(() => this.state().paintings.find(p => p.id === id));
  }

  createPainting(paintingData: Painting) {
    this.state.update(s => ({ ...s, isLoading: true, error: null }));

    return this.paintingsApi.addPainting(paintingData).pipe(
      tap((newPainting: Painting) => {
        this.state.update(s => ({
          ...s,
          isLoading: false,
          paintings: [...s.paintings, newPainting]
        }));
      }),
      catchError(err => {
        this.state.update(s => ({ ...s, isLoading: false, error: 'La création a échoué.' }));
        return throwError(() => err);
      })
    );
  }

  /**
   * Met à jour un tableau existant.
   * @param id - L'ID du tableau à mettre à jour.
   * @param paintingUpdate - Un objet partiel contenant les nouvelles données.
   */
  updatePainting(id: string, paintingUpdate: Partial<Painting>) {
    this.state.update(s => ({ ...s, loading: true, error: null }));

    return this.paintingsApi.updatePainting(id, paintingUpdate).pipe(
      tap((updatedPainting: Painting) => {
        this.state.update(s => ({
          ...s,
          loading: false,
          paintings: s.paintings.map(p => p.id === id ? updatedPainting : p)
        }));
      }),
      catchError(err => {
        this.state.update(s => ({ ...s, loading: false, error: 'La mise à jour a échoué.' }));
        return throwError(() => err);
      })
    );
  }

  deletePainting(id: string) {
    this.state.update(s => ({ ...s, loading: true, error: null }));

    return this.paintingsApi.deletePainting(id).pipe(
      tap(() => {
        this.state.update(s => ({
          ...s,
          loading: false,
          paintings: s.paintings.filter(p => p.id !== id)
        }));
      }),
      catchError(err => {
        this.state.update(s => ({ ...s, loading: false, error: 'La suppression a échoué.' }));
        return throwError(() => err);
      })
    );
  }
}
