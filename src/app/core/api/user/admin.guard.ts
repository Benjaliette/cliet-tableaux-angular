// src/app/core/guards/admin.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@app/core/auth/auth.service';
import { map } from 'rxjs/operators'; // Si vous utilisez un Observable

export const adminGuard: CanActivateFn = () => {
  const authService: AuthService = inject(AuthService);
  const router = inject(Router);

  const isAdmin = authService.currentUser()?.admin ?? false;

  if (isAdmin) {
    return true;
  }

  return router.parseUrl('/users/' + authService.currentUser()?.id); 
};
