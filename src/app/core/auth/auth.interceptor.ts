import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '@environments/environment';
import { catchError, tap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const apiUrl = environment.apiUrl;
  const authService = inject(AuthService);
  const currentUser = authService.currentUser();

  if (currentUser?.token && request.url.startsWith(apiUrl)) {
    request = authService.addTokenToRequest(request, currentUser.token);
  }

  return next(request).pipe(
    catchError(error => {
      console.log(error);
      if (error instanceof HttpErrorResponse && error.status === 401 && !request.url.includes('/auth/refresh')) {
        return authService.handle401Error(request, next);
      }
      
      return throwError(() => error);
    })
  );
};
