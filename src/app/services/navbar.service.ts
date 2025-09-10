import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root' // let this service be available globally
})
export class NavbarService {

  // Subject/observable for the state of the sidebar (visible or not).
  private sidebarState = new BehaviorSubject<boolean>(false);
  sidebarState$ = this.sidebarState.asObservable();

  // Subject/observable for the current tab that should be displayed in the home page.
  private currentHomeContent = new BehaviorSubject<string>("home");
  currentHomeContent$ = this.currentHomeContent.asObservable();

  // Valid tab options.
  tabOptions = new Set([
    'home', 'projects', 'blog', 'papers',
  ]);

  /**
   * Updates the `sidebarState` based on the string that is passed given that it
   * is a valid option.
   * @param tab -- New state of the tab.
   */
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

  /**
   * Toggles the sidebar between visible and not visible.
   */
  toggleSidebar() {
    this.sidebarState.next(!this.sidebarState.value);
  }

  /**
   * Closes the sidebar by setting it to not visible.
   */
  closeSidebar() {
    this.sidebarState.next(false);
  }

}
