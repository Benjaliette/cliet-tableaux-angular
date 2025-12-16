import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface CloudinarySignature {
  timestamp: number;
  signature: string;
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
}

@Injectable({
  providedIn: 'root'
})
export class CloudinaryUploadService {
  private http = inject(HttpClient);
  
  private readonly apiUrl = environment.apiUrl;
  private readonly CLOUD_NAME = environment.cloudinary.cloudName;
  private readonly UPLOAD_PRESET = environment.cloudinary.uploadPreset;
  private readonly FOLDER_NAME = environment.cloudinary.folderName;
  private readonly API_KEY = '833117657931665';

  uploadImage(file: File): Observable<string | null> {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${this.CLOUD_NAME}/image/upload`;

    return this.getSignature().pipe(
      map((response: CloudinarySignature) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.UPLOAD_PRESET);
        formData.append('api_key', this.API_KEY);
        formData.append('timestamp', response.timestamp.toString());
        formData.append('signature', response.signature);
        formData.append('folder', this.FOLDER_NAME);
        
        return { uploadUrl, formData };
      }),
      switchMap(({ uploadUrl, formData }) => 
        this.http.post<CloudinaryUploadResponse>(uploadUrl, formData)
      ),
      map(cloudinaryResponse => cloudinaryResponse.public_id || null)
    );
  }

  private getSignature(): Observable<CloudinarySignature> {
    const body = { folder: this.FOLDER_NAME };
    return this.http.post<CloudinarySignature>(`${this.apiUrl}/cloudinary-signature`, body);
  }
}
