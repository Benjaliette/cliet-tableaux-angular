import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Painting } from '@shared/models/painting.model';
import { environment } from '@environments/environment'; // Importer l'environnement

@Injectable({
  providedIn: 'root'
})
export class PaintingsApiService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private log(message: string) {
    console.log(`PaintingsApiService: ${message}`);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return throwError(() => new Error(`Erreur lors de l'opération ${operation}.`));
    };
  }

  /** GET: récupérer tous les tableaux depuis le serveur */
  getPaintings(): Observable<Painting[]> {
    return this.http.get<Painting[]>(`${this.apiUrl}/paintings`).pipe(
      tap(_ => this.log('fetched paintings')),
      catchError(this.handleError<Painting[]>('getPaintings', []))
    );
  }

  /** GET: récupérer un tableau par son id. Retourne `undefined` si non trouvé (404). */
  getPaintingById(id: string): Observable<Painting | undefined> {
    const url = `${this.apiUrl}/paintings/${id}`;
    return this.http.get<Painting>(url).pipe(
      tap(_ => this.log(`fetched painting id=${id}`)),
      catchError((error: HttpErrorResponse): Observable<undefined> => {
        if (error.status === 404) {
          this.log(`painting id=${id} not found`);
          return of(undefined);
        }
        return throwError(() => new Error(`Erreur lors de la récupération du tableau id=${id}.`));
      })
    );
  }

  /**
   * PUT: mettre à jour un tableau sur le serveur.
   * @param id - L'ID du tableau à modifier.
   * @param paintingData - Les données mises à jour du tableau.
   */
  updatePainting(id: string, paintingData: Partial<Painting>): Observable<Painting> {
    const url = `${this.apiUrl}/paintings/${id}`;
    return this.http.put<Painting>(url, paintingData).pipe(
      tap(updatedPainting => this.log(`updated painting id=${updatedPainting.id}`)),
      catchError(this.handleError<Painting>('updatePainting'))
    );
  }

  addPainting(paintingData: Painting): Observable<Painting> {
    return this.http.post<Painting>(`${this.apiUrl}/paintings`, paintingData).pipe(
      tap(_ => this.log('fetched paintings')),
      catchError(this.handleError<Painting>('addPainting'))
    );
  }

  deletePainting(id: string): Observable<{}> {
    const url = `${this.apiUrl}/paintings/${id}`;
    return this.http.delete<{}>(url).pipe(
      tap(_ => this.log(`deleted painting id=${id}`)),
      catchError(this.handleError<{}>('deletePainting'))
    );
  }
}
