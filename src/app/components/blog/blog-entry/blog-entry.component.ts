// import {
//   Component,
//   AfterViewInit,
//   ViewChild,
//   ElementRef,
//   ViewContainerRef,
//   Injector,
//   Type, inject
// } from '@angular/core';
// import {HttpClient, HttpClientModule} from '@angular/common/http';
// import { marked } from 'marked';
// import { ActivatedRoute, Router } from '@angular/router';
// import { MathjaxService } from '../../../services/mathjax.service';
// import { firstValueFrom } from 'rxjs';
//
// type ComponentLoader = (() => Type<any>) | (() => Promise<Type<any>>);
//
// @Component({
//   selector: 'app-blog-entry',
//   template: `
//     <div #container></div>
//     <ng-template #vcr></ng-template>
//   `,
//   imports: [
//     HttpClientModule
//   ]
// })
// export class BlogEntryComponent implements AfterViewInit {
//   @ViewChild('container', { static: true }) container!: ElementRef<HTMLDivElement>;
//   @ViewChild('vcr', { read: ViewContainerRef, static: true }) vcr!: ViewContainerRef;
//
//   mdPath!: string;
//
//   // Injected services
//   private readonly route: ActivatedRoute = inject(ActivatedRoute);
//   private readonly router: Router = inject(Router);
//   private readonly http: HttpClient = inject(HttpClient);
//   private readonly injector: Injector = inject(Injector);
//   private readonly mathjax: MathjaxService = inject(MathjaxService);
//
//   private componentRegistry: Record<string, ComponentLoader> = {
//     'app-first-entry-chart-example': () =>
//       import('../blog-widgets/first-entry-chart-example/first-entry-chart-example.component')
//         .then(m => m.FirstEntryChartExampleComponent)
//   };
//
//   async ngAfterViewInit() {
//     const path = this.route.snapshot.queryParamMap.get('path');
//     if (!path) {
//       this.router.navigate(['/blog']);
//       return;
//     }
//
//     this.mdPath = decodeURIComponent(path);
//
//     try {
//       const md = await firstValueFrom(this.http.get(this.mdPath, { responseType: 'text' }));
//       const html = await Promise.resolve(marked.parse(md, { gfm: true, breaks: false }));
//
//       // Append HTML as real DOM nodes
//       const tempDiv = document.createElement('div');
//       tempDiv.innerHTML = html;
//       while (tempDiv.firstChild) {
//         this.container.nativeElement.appendChild(tempDiv.firstChild);
//       }
//
//       // Instantiate Angular components inside placeholders
//       await this.instantiateEmbeddedComponents();
//
//       // Typeset math after DOM is fully attached
//       await this.mathjax.typeset(this.container.nativeElement);
//
//     } catch (err) {
//       console.error('Error loading blog entry', err);
//     }
//   }
//
//   private async instantiateEmbeddedComponents(): Promise<void> {
//     for (const tag of Object.keys(this.componentRegistry)) {
//       const nodeList = this.container.nativeElement.querySelectorAll(tag);
//       for (const el of Array.from(nodeList) as HTMLElement[]) {
//         try {
//           const loader = this.componentRegistry[tag];
//           const compTypeOrPromise = loader();
//           const compType = compTypeOrPromise instanceof Promise ? await compTypeOrPromise : compTypeOrPromise;
//           const compRef = this.vcr.createComponent(compType, { injector: this.injector });
//           this.transferAttributesToComponent(el, compRef.instance);
//           el.replaceWith(compRef.location.nativeElement);
//         } catch (err) {
//           console.error('Error instantiating component for tag', tag, err);
//         }
//       }
//     }
//   }
//
//   private transferAttributesToComponent(el: HTMLElement, instance: any) {
//     if (!el.attributes) return;
//     for (const attr of el.attributes) {
//       const name = this.kebabToCamel(attr.name);
//       let value: string | boolean | number = attr.value;
//
//       if (value === 'true') value = true;
//       else if (value === 'false') value = false;
//       else if (!isNaN(Number(value))) value = Number(value);
//       else {
//         const trimmed = value.trim();
//         if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
//           (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
//           try { value = JSON.parse(trimmed); } catch {}
//         }
//       }
//
//       try { instance[name] = value; } catch {}
//     }
//   }
//
//   private kebabToCamel(s: string) {
//     return s.replace(/-([a-z])/g, g => g[1].toUpperCase());
//   }
// }
