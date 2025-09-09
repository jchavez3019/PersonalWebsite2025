import {Component, inject, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {NavbarComponent} from './components/navbar/navbar.component';
import {FooterComponent} from './components/footer/footer.component';
import {MatDrawer, MatDrawerContainer} from "@angular/material/sidenav";

/* services */
import {NavbarService} from './services/navbar.service';
import {MatAnchor} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    MatAnchor,
    MatDrawer,
    MatDrawerContainer,
    MatIcon,
    RouterLink,
    RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'PersonalWebsite';
  sidebarVisible = false;

  private readonly navbarService: NavbarService = inject(NavbarService);

  ngOnInit() {
    this.navbarService.sidebarState$.subscribe(state => {
      this.sidebarVisible = state;
    })
  }

  closeSidebar() {this.navbarService.closeSidebar();}
}
