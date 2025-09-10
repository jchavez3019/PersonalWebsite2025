import {Component, inject, OnInit} from '@angular/core';
import {DomSanitizer, SafeResourceUrl} from '@angular/platform-browser';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-pdf-viewer',
  imports: [],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.css'
})
export class PdfViewerComponent implements OnInit {
  safeUrl!: SafeResourceUrl;

  // Injected services
  private readonly sanitizer: DomSanitizer = inject(DomSanitizer);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const filename = params.get('filename');
      if (filename) {
        this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(filename);
      }
    });
  }
}
