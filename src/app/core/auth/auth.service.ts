import { Injectable, signal, WritableSignal, computed, Signal } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, tap, throwError } from 'rxjs';
import { User } from '@shared/models/user.model';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { Login } from '@app/shared/models/login.model';
import { Signup } from '@app/shared/models/signup.model';
import { AuthResponse } from '@app/shared/models/auth-response.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private currentUserSignal: WritableSignal<User | null> = signal<User | null>(null);
  public currentUser: Signal<User | null> = this.currentUserSignal.asReadonly();
  public isLoggedIn = computed(() => this.currentUser() !== null);
  private readonly apiUrl = environment.apiUrl;
  private isRefreshing = false; 
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadInitialUser();
  }

  private loadInitialUser(): void {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      this.currentUserSignal.set(JSON.parse(userJson));
    }
  }

  login(userData: Login): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, userData, { withCredentials: true }).pipe(
      tap(response => this.setAuthentication(response))
    );
  }

  register(userData: Signup): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/signup`, userData, { withCredentials: true }).pipe(
      tap(response => this.setAuthentication(response))
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true }).subscribe({
      next: () => {
        console.log('Logout successful on backend');
      },
      error: (err) => {
        console.error('Logout failed on backend', err);
      },
      complete: () => {
        localStorage.removeItem('currentUser');
        this.currentUserSignal.set(null);
        this.router.navigate(['/users/login']);
      }
    });
  }

  private createUser(response: {user: User, token: string}) {
      const userWithToken = { ...response.user, token: response.token };
      localStorage.setItem('currentUser', JSON.stringify(userWithToken));
      this.currentUserSignal.set(userWithToken);
  }

  private setAuthentication(response: AuthResponse): void {
    const userWithToken: User = { ...response.user, token: response.accessToken };
    localStorage.setItem('currentUser', JSON.stringify(userWithToken));
    this.currentUserSignal.set(userWithToken);
  }

  private refreshToken(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, {}, { withCredentials: true }).pipe(
      tap(response => {
        this.setAuthentication(response);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  handle401Error(request: HttpRequest<any>, next: (req: HttpRequest<any>) => Observable<HttpEvent<any>>): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.refreshToken().pipe(
        switchMap((authResponse: AuthResponse) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(authResponse.accessToken);
          return next(this.addTokenToRequest(request, authResponse.accessToken));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.logout();
          return throwError(() => error);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next(this.addTokenToRequest(request, jwt));
        })
      );
    }
  }

  addTokenToRequest(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
}