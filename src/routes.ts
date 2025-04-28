import { Routes } from '@angular/router';

/* generated components */
import {HomeComponent} from './app/components/home/home.component';
import {ProjectsComponent} from './app/components/projects/projects.component';
import {PapersComponent} from './app/components/papers/papers.component';
import {BlogComponent} from './app/components/blog/blog.component';
/*
    The 3rd entry is a wildcard where any url that
    doesn't match other entries just redirects to the login page
*/
export const appRoutes: Routes = [
  {path: '', component: HomeComponent, pathMatch: 'full'},
  {path: 'projects', component: ProjectsComponent},
  {path: 'blog', component: BlogComponent},
  {path: 'papers', component: PapersComponent},
  {path: '**', redirectTo: ''}
];
