import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root' // let this service be available globally
})
export class NavbarService {
  private sidebarState = new BehaviorSubject<boolean>(false);
  sidebarState$ = this.sidebarState.asObservable();

  private currentHomeContent = new BehaviorSubject<string>("home");
  currentHomeContent$ = this.currentHomeContent.asObservable();

  tabOptions = new Set([
    'home', 'projects', 'blog', 'papers',
  ]);

  navigateTab(tab: string) {
    // Tab to navigate towards does not exist in our options
    if (!this.tabOptions.has(tab)) {
      console.error(`Tab ${tab} not found`);
      return;
    }

    // Close the sidebar upon navigation
    this.closeSidebar();
    // Emit the new tab (potentially repeated) tab
    this.currentHomeContent.next(tab);
    return;
  }

  toggleSidebar() {
    this.sidebarState.next(!this.sidebarState.value);
  }

  closeSidebar() {
    this.sidebarState.next(false);
  }

}
