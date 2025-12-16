import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageTransformationService {
  private readonly cloudName = 'dxcrr7aon'; 
  private readonly folder = 'production';
  private readonly baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`;

  /**
   * Génère une URL pour une image pleine résolution, optimisée pour le web.
   * q_auto: Qualité automatique
   * f_auto: Format automatique (WebP, AVIF...)
   * @param publicId L'identifiant unique de l'image sur Cloudinary.
   */
  getFullImageUrl(publicId: string | undefined): string {
    if (!publicId) {
      return 'assets/placeholder.jpg'; // Une image par défaut si l'ID est manquant
    }
    const transformations = 'c_fill,w_1000,q_auto,f_auto';
    return `${this.baseUrl}/${transformations}/${publicId}`;
  }

  /**
   * Génère une URL pour une miniature carrée, optimisée pour les galeries.
   * c_fill: Recadre pour remplir l'espace sans déformer.
   * w_400: Largeur et hauteur de 400px.
   * g_auto: Tente de centrer le recadrage sur le sujet principal de l'image.
   * @param publicId L'identifiant unique de l'image sur Cloudinary.
   */
  getThumbnailUrl(publicId: string | undefined | null): string {
    if (!publicId) {
      return 'assets/placeholder.jpg';
    }
    const transformations = 'c_fill,w_400,g_auto,q_auto,f_auto';
    return `${this.baseUrl}/${transformations}/${publicId}`;
  }

  /**
   * Génère une URL pour un placeholder optimisé pendant le chargement de l'image
   * @param publicId L'identifiant unique de l'image sur Cloudinary.
   * @returns La nouvelle URL avec les transformations.
   */
  getPlaceholderUrl(publicId: string | undefined): string {
    if (!publicId) {
      return 'assets/placeholder.jpg';
    }
    const transformations = 'w_30,q_auto:low,e_blur:2000,f_auto';
    return `${this.baseUrl}/${transformations}/${publicId}`;
  }
}
