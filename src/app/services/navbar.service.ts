import {inject, Injectable} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root' // let this service be available globally
})
export class NavbarService {
  private sidebarState = new BehaviorSubject<boolean>(false);
  sidebarState$ = this.sidebarState.asObservable();

  // Inject services
  private readonly router: Router = inject(Router);

  constructor() {

    // Subscribe the router events to close the side-bar on navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.closeSidebar();
      }
    });
  }

  toggleSidebar() {
    this.sidebarState.next(!this.sidebarState.value);
  }

  closeSidebar() {
    this.sidebarState.next(false);
  }

}
