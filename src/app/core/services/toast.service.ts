import { Injectable, signal } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<Toast[]>([]);

  showSuccess(message: string) {
    this.addToast(message, 'success');
  }

  showError(message: string) {
    this.addToast(message, 'error');
  }

  private addToast(message: string, type: 'success' | 'error') {
    const id = Date.now();
    this.toasts.update(currentToasts => [...currentToasts, { id, message, type }]);

    setTimeout(() => this.removeToast(id), 5000);
  }

  removeToast(id: number) {
    this.toasts.update(currentToasts => currentToasts.filter(t => t.id !== id));
  }
}
