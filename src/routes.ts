import { Routes } from '@angular/router';

/* generated components */
import {HomeComponent} from './app/components/home/home.component';
import {ProjectsComponent} from './app/components/projects/projects.component';
import {PapersComponent} from './app/components/papers/papers.component';
import {BlogComponent} from './app/components/blog/blog.component';
import {BlogEntryComponent} from './app/components/blog/blog-entry/blog-entry.component';
/*
    The 3rd entry is a wildcard where any url that
    doesn't match other entries just redirects to the login page
*/
export const appRoutes: Routes = [
  {path: '', component: HomeComponent, pathMatch: 'full'},
  {path: 'projects', component: ProjectsComponent},
  {path: 'blog', children: [
      {
        path: '',
        component: BlogComponent,
      },
      {
        path: ':id',
        component: BlogEntryComponent,
      }
    ]},
  {path: 'papers', component: PapersComponent},
  {path: '**', redirectTo: ''}
];
