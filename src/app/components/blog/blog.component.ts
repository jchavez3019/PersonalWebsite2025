import { Component } from '@angular/core';
import{ CommonModule } from '@angular/common';
import {MatCard, MatCardSubtitle, MatCardTitle, MatCardActions, MatCardContent, MatCardHeader} from '@angular/material/card';
import {MatButton} from '@angular/material/button';
import {Router} from '@angular/router';

import {BlogEntryComponent} from './blog-entry/blog-entry.component';
import {BlogEntry} from './blog-entry.interface';

@Component({
  selector: 'app-blog',
  imports: [
    CommonModule,
    MatButton,
    MatCard,
    MatCardTitle,
    MatCardSubtitle,
    MatCardActions,
    MatCardContent,
    MatCardHeader
  ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.css'
})
export class BlogComponent {
  blogEntries: BlogEntry[] = [
    {
      id: '1',
      title: "First Blog Post",
      summary: "Brief description of first blog post.",
      date: new Date('2025-04-27'),
      content: `
      This is an introduction to linear programming. Consider the following optimization problem:

      [latex]
      \\begin{align*}
      \\text{maximize} \\quad & z = 3x_1 + 2x_2 \\\\
      \\text{subject to} \\quad & 2x_1 + x_2 \\leq 100 \\\\
      & x_1 + x_2 \\leq 80 \\\\
      & x_1, x_2 \\geq 0
      \\end{align*}
      [/latex]

      The solution to this problem can be found using the simplex method. Let's examine the steps:

      1. First, we convert to standard form
      2. Then we create the initial tableau

      Here's another example of an inline equation: [latex]x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}[/latex]

      We can also include algorithms:

      [latex]
      \\begin{algorithm}
      \\caption{Basic Simplex Algorithm}
      \\begin{algorithmic}
      \\WHILE{not optimal}
        \\STATE Choose entering variable
        \\STATE Choose leaving variable
        \\STATE Pivot
      \\ENDWHILE
      \\end{algorithmic}
      \\end{algorithm}
      [/latex]
      `
    }
  ];

  selectedEntry: BlogEntry | null = null;

  constructor(private router: Router) { }

  showEntry(entry: BlogEntry) {
    this.selectedEntry = entry;
    // update the URL to this blog entry
    this.router.navigate(['blog', entry.id], {
      replaceUrl: true
    });
  }

  backToList() {
    this.selectedEntry = null;
    this.router.navigate(['/blog'], {replaceUrl: true});
  }
}
