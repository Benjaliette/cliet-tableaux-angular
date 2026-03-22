import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CheckoutSessionRequest } from '@app/shared/models/checkout-session-request';
import { CheckoutSessionResponse } from '@app/shared/models/checkout-session-response';
import { environment } from '@environments/environment';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface PaymentIntentResponse {
  clientSecret: string;
  amount: number;
  currency: string;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  #http = inject(HttpClient);

  #stripePromise: Promise<Stripe | null> | null = null;

  constructor() {
    this.#stripePromise = loadStripe(environment.stripePublicKey);
  }

  createCheckoutSession(request: CheckoutSessionRequest): Observable<CheckoutSessionResponse> {
    return this.#http.post<CheckoutSessionResponse>('api/v1/orders/create-checkout-session', request)
      .pipe(
        catchError((error) => this.handleError(error))
      );
  }

  redirectToCheckout(checkoutUrl: string): void {
    if (!checkoutUrl) {
      console.error('Invalid checkout URL');
      throw new Error('Invalid checkout URL provided');
    }

    console.log('Redirecting to Stripe Checkout:', checkoutUrl);
    window.location.href = checkoutUrl;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    console.error(errorMessage);

    return throwError(() => new Error(errorMessage));
  }
}
