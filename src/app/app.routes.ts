/* generated components */
import { Routes } from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {ProjectsComponent} from './components/projects/projects.component';
import {BlogComponent} from './components/blog/blog.component';
import {BlogEntryComponent} from './components/blog/blog-entry/blog-entry.component';
import {PapersComponent} from './components/papers/papers.component';

/*
    Entry '**' is a wildcard where any url that
    doesn't match other entries just redirects to the login page
*/
export const routes: Routes = [
  {path: '', component: HomeComponent, pathMatch: 'full'},
  {path: 'projects', component: ProjectsComponent},
  {path: 'blog', component: BlogComponent},
  { path: 'blog/entry', component: BlogEntryComponent },
  {path: 'papers', component: PapersComponent},
  {path: '**', redirectTo: ''}
];
