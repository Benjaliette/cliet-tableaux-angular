import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'environments/environment';
import { Contact } from '@app/shared/models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactApiService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/contact`;

  sendContactForm(formData: Contact): Observable<void> {
    return this.http.post<void>(this.apiUrl, formData);
  }
}
