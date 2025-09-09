import {Component, inject, OnInit} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {FooterComponent} from './footer/footer.component';
import {MatDrawer, MatDrawerContainer} from '@angular/material/sidenav';
import {NavbarComponent} from './navbar/navbar.component';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {NavbarService} from '../../services/navbar.service';
import {HomeContentComponent} from './home-content/home-content.component';
import {distinctUntilChanged} from 'rxjs';
import {ProjectsComponent} from './projects/projects.component';
import {PapersComponent} from './papers/papers.component';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatIcon,
    FooterComponent,
    MatAnchor,
    MatDrawer,
    MatDrawerContainer,
    NavbarComponent,
    RouterLink,
    RouterLinkActive,
    HomeContentComponent,
    ProjectsComponent,
    PapersComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  title = 'PersonalWebsite';
  sidebarVisible = false;
  contentTab = 'home';

  private readonly navbarService: NavbarService = inject(NavbarService);

  ngOnInit() {

    // Subscribe to the state of the sidebar in order to determine if it should be
    // visible or not.
    this.navbarService.sidebarState$.subscribe(state => {
      this.sidebarVisible = state;
    });

    // Subscribe to the main content that should be displayed.
    this.navbarService.currentHomeContent$.pipe(
      distinctUntilChanged(),
    ).subscribe((content: string) => {
      this.contentTab = content;
    })
  }

  closeSidebar() {this.navbarService.closeSidebar();}
}
