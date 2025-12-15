import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToyAgenticFrameworkFrontendComponent } from './toy-agentic-framework-frontend.component';

describe('ToyAgenticFrameworkFrontendComponent', () => {
  let component: ToyAgenticFrameworkFrontendComponent;
  let fixture: ComponentFixture<ToyAgenticFrameworkFrontendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToyAgenticFrameworkFrontendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToyAgenticFrameworkFrontendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
