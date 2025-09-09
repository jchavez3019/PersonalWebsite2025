// import { Injectable } from '@angular/core';
// import { TeX } from 'mathjax-full/js/input/tex.js';
// import { CHTML } from 'mathjax-full/js/output/chtml.js';
// import { mathjax } from 'mathjax-full/js/mathjax.js';
// import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor.js';
// import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
// import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class MathjaxService {
//   private MathJax: any;
//
//   constructor() {
//     const adaptor = liteAdaptor();
//     RegisterHTMLHandler(adaptor);
//
//     this.MathJax = mathjax.document('', {
//       InputJax: new TeX({ packages: AllPackages, tags: 'all' }),
//       OutputJax: new CHTML({ fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2' })
//     });
//   }
//
//   typeset(element: HTMLElement) {
//     this.MathJax.root = element;
//     this.MathJax.render();
//   }
// }
import { Injectable } from '@angular/core';
import { mathjax } from 'mathjax-full/js/mathjax.js';
import { TeX } from 'mathjax-full/js/input/tex.js';
import { CHTML } from 'mathjax-full/js/output/chtml.js';
import { browserAdaptor } from 'mathjax-full/js/adaptors/browserAdaptor.js';
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html.js';
import { AllPackages } from 'mathjax-full/js/input/tex/AllPackages.js';
import {MathDocument} from 'mathjax-full/js/core/MathDocument';

@Injectable({ providedIn: 'root' })
export class MathjaxService {
  private doc: MathDocument<any, any, any>;

  constructor() {
    const adaptor = browserAdaptor();
    RegisterHTMLHandler(adaptor);

    this.doc = mathjax.document(document.body, {
      InputJax: new TeX({ packages: AllPackages, tags: 'all' }),
      OutputJax: new CHTML({ fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2' })
    });
  }

  async typeset(element: HTMLElement) {
    // Create a MathJax document for this element
    const doc = mathjax.document(element, {
      InputJax: new TeX({ packages: AllPackages, tags: 'all' }),
      OutputJax: new CHTML({ fontURL: 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/output/chtml/fonts/woff-v2' })
    });
    await doc.render();
  }
}


