import {Component, HostListener, inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';

/* services */
import { NavbarService} from '../../../services/navbar.service';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  sidebarVisible = false;

  // Inject services
  private readonly navbarService: NavbarService = inject(NavbarService);

  ngOnInit() {
    this.navbarService.sidebarState$.subscribe(state => {
      this.sidebarVisible = state;
    })
  }

  @HostListener('window:keydown.esc')
  onEscape() {
    // this.isDrawerOpen = false;
    this.navbarService.closeSidebar();
  }

  toggle() {
    this.navbarService.toggleSidebar();
  }

  navigateTab(tab: string) {
    this.navbarService.navigateTab(tab);
  }
}
