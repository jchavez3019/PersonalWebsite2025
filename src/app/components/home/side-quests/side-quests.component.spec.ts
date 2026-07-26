/**
 * Side Quests listing component tests.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SideQuestsComponent } from './side-quests.component';

describe('SideQuestsComponent', () => {
  let component: SideQuestsComponent;
  let fixture: ComponentFixture<SideQuestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideQuestsComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SideQuestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('test_renders_mandarin_bingo_catalog_fields', () => {
    /**
     * Given the catalog array
     * When the component renders
     * Then Mandarin bingo title, description, date, and preview are present
     */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Mandarin Character Bingo');
    expect(compiled.textContent).toContain('July 26, 2026');
    const img = compiled.querySelector('img.quest-preview') as HTMLImageElement | null;
    expect(img?.getAttribute('src')).toBe('assets/side_quests/bingo_board_icon.png');
  });

  it('test_bingo_open_link_targets_mandarin_bingo_route', () => {
    /**
     * Given the Mandarin bingo entry
     * When the Open control is rendered
     * Then routerLink points at /side-quests/mandarin-bingo
     */
    const compiled = fixture.nativeElement as HTMLElement;
    const open = compiled.querySelector('a.quest-open');
    expect(open?.getAttribute('href')).toBe('/side-quests/mandarin-bingo');
  });
});
