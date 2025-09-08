import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstEntryChartExampleComponent } from './first-entry-chart-example.component';

describe('FirstEntryChartExampleComponent', () => {
  let component: FirstEntryChartExampleComponent;
  let fixture: ComponentFixture<FirstEntryChartExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirstEntryChartExampleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirstEntryChartExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
