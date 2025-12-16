import {Pipe, PipeTransform, inject, Injectable} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import MarkdownIt from 'markdown-it';
import { MathJaxService } from './mathjax.service';

@Pipe({
  name: 'renderLLMResponse',
  standalone: true
})
@Injectable({ providedIn: 'root' })
export class RenderLLMResponsePipe implements PipeTransform {
  private md = new MarkdownIt({
    html: true, // convert to html
    linkify: true, // turns links into refs that can be clicked
    typographer: true
  });
  private sanitizer = inject(DomSanitizer);
  private mathJaxService = inject(MathJaxService);

  async transform(value: string, sources: string[], docPath: string): Promise<SafeHtml> {
    if (!value) return '';

    // 1. Replace [Source i] with Markdown Link Emoji
    const withLinks = value.replace(/\[Source (\d+)\]/g, (match, index) => {
      const url = sources[parseInt(index) - 1];
      return url ? `[🔗](${url})` : match;
    });

    // We turn \( into \\( so MarkdownIt outputs \(
    const protectedMath: string = withLinks
      .replace(/\\\(/g, '\\\\(')
      .replace(/\\\)/g, '\\\\)')
      .replace(/\\\[/g, '\\\\[')
      .replace(/\\\]/g, '\\\\]')
      .replace(/_/g, '\\_');

    // 3. Convert Markdown to HTML
    const htmlContent = this.md.render(protectedMath);
    console.log(`Here is the protected math: \n${protectedMath}`);
    console.log(`HTML content after passing to MarkdownIt: \n${htmlContent}`);

    // 3. Pass to your MathJax Service for LaTeX rendering
    const mathJaxHtml = await this.mathJaxService.renderDocument(docPath, htmlContent);

    // 4. Sanitize for Angular
    return this.sanitizer.bypassSecurityTrustHtml(mathJaxHtml);
  }
}
