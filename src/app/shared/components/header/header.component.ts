import { Component, computed, ElementRef, HostListener, inject, signal, ViewChild, WritableSignal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LogoComponent } from '../logo/logo.component';
import { AuthService } from '@app/core/auth/auth.service';
import { User } from '@app/shared/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule, LogoComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private elementRef = inject(ElementRef);
  
  public currentUser = this.authService.currentUser;
  public isLoggedIn = this.authService.isLoggedIn;
  
  public isDropdownOpen = signal(false);

  public toggleDropdown(): void {
    this.isDropdownOpen.update(value => !value);
  }
  
  public logout(): void {
    this.isDropdownOpen.set(false);
    this.authService.logout();
  }

  readonly username = computed(() => {
    if (this.currentUser()?.firstName) {
      return this.capitalizeName(this.currentUser()?.firstName!);
    }
    
    if (this.currentUser()?.lastName) {
      return 'M. ou Mme ' + this.capitalizeName(this.currentUser()?.lastName!);
    }

    return this.currentUser()?.email!;
  });

  @ViewChild('userMenu') userMenu: ElementRef | undefined;
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.userMenu?.nativeElement.contains(event.target as Node);

    if (!clickedInside) {
      this.isDropdownOpen.set(false);
    }
  }

  private capitalizeName(name: string) : string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
