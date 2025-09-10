import {Component, Input, OnInit, ElementRef, inject} from '@angular/core';

@Component({
  selector: 'app-first-entry-chart-example',
  imports: [],
  templateUrl: './first-entry-chart-example.component.html',
  styleUrl: './first-entry-chart-example.component.css'
})
export class FirstEntryChartExampleComponent implements OnInit {
  @Input() title = 'Example Chart';
  @Input() data = { n: 50, color: 'steelblue' };

  // Inject services
  private readonly el: ElementRef = inject(ElementRef);

  ngOnInit(): void {
    // sample: draw on canvas or initialize d3 chart using this.data
    const canvas = this.el.nativeElement.querySelector('canvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d')!;
    canvas.width = 400; canvas.height = 120;
    ctx.fillStyle = this.data.color || 'steelblue';
    for (let i = 0; i < (this.data.n || 10); i++) {
      ctx.fillRect(i*8, Math.random()*100, 6, 6);
    }
  }
}
