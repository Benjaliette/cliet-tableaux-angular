import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { authGuard } from '@app/core/auth/auth.guard';
import { adminGuard } from './core/api/user/admin.guard';


export const routes: Routes = [
  {
    path: 'users/login',
    loadComponent: () => import('./features/user/login/login.component').then(m => m.LoginComponent),
    title: 'Identification - Cliet Tableaux'
  },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'gallery',
        loadComponent: () => import('./features/gallery/gallery.component').then(m => m.GalleryComponent),
        title: 'Galerie - Cliet Tableaux'
      },
      {
        path: 'painting/:id',
        loadComponent: () => import('./features/painting-detail/painting-detail.component').then(m => m.PaintingDetailComponent),
        title: 'Détail de l\'œuvre - Cliet Tableaux'
      },
      {
        path: 'about',
        loadComponent: () => import('./features/artist/artist.component').then(m => m.ArtistComponent),
        title: 'L\'artiste - Cliet Tableaux'
      },
      {
        path: 'ondemand',
        loadComponent: () => import('./features/ondemand/ondemand.component').then(m => m.OndemandComponent),
        title: 'A la demande - Cliet Tableaux'
      },
      {
        path: 'contact',
        loadComponent: () => import('./features/contact/contact.component').then(m => m.ContactComponent),
        title: 'Contact - Cliet Tableaux'
      },
      {
        path: 'users/:id',
        loadComponent: () => import('./features/user/account-page/account-page.component').then(m => m.AccountPageComponent),
        title: 'Mon compte - Cliet Tableaux',
        canActivate: [authGuard]
      },
      {
        path: 'admin/paintings/add',
        loadComponent: () => 
          import('./features/add-painting/add-painting.component').then(m => m.AddPaintingComponent),
        canActivate: [authGuard, adminGuard]
      },
      {
        path: 'admin/edit-painting/:id', 
        loadComponent: () => import('./features/edit-painting/edit-painting.component').then(m => m.EditPaintingComponent),
        canActivate: [authGuard, adminGuard]
      },
      {
        // Route par défaut si l'URL ne correspond à rien
        path: '**',
        redirectTo: '/gallery'
      }
    ]
  },
];
