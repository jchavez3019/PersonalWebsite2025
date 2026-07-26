/* generated components */
import { Routes } from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {PdfViewerComponent} from './components/pdf-viewer/pdf-viewer.component';
import {
  ToyAgenticFrameworkFrontendComponent
} from './components/hosted_projects/toy-agentic-framework-frontend/toy-agentic-framework-frontend.component';
import {MandarinBingoComponent} from './components/side-quests/mandarin-bingo/mandarin-bingo.component';
// import {BlogEntryComponent} from './components/blog/blog-entry/blog-entry.component';

/*
    TODO:
      We may bring back the blog entry component once it is complete. However, the router may be overkill
      for navigating between tabs on the home-page. It is much better to refactor the router completely
      to handle more diverse pages. For example, we may let the home page navigate between tabs using
      simple variables, and instead use routing to navigate to different pages that can show blog entries
      rendered with MathJax and potentially other types of pages.
*/

/*
    Entry '**' is a wildcard where any url that
    doesn't match other entries just redirects to the login page
*/
export const routes: Routes = [
  {path: '', component: HomeComponent, pathMatch: 'full'},
  // // { path: 'blog/entry', component: BlogEntryComponent },
  { path: 'pdf-viewer/:filename', component: PdfViewerComponent },
  { path: 'toy-agentic-framework-v0', component: ToyAgenticFrameworkFrontendComponent},
  { path: 'side-quests/mandarin-bingo', component: MandarinBingoComponent },
  {path: '**', redirectTo: ''},
];
