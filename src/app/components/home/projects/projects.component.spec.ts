import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectsComponent } from './projects.component';
import {provideRouter} from '@angular/router';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [provideRouter([])]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have working links (no 404s)', async () => {
    const anchorElements: HTMLAnchorElement[] = fixture.nativeElement.querySelectorAll('a');

    const hrefs: string[] = Array.from(anchorElements)
      .map((a: HTMLAnchorElement) => a.href)
      .filter(href => !!href);

    expect(hrefs.length).toBeGreaterThan(0);

    for (const href of hrefs) {
      const response = await fetch(href, { method: 'HEAD' });
      expect(response.status).not.toBe(404);
    }
  });
});
