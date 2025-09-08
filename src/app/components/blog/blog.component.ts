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
      title: "First Blog Post",
      summary: "Brief description of first blog post.",
      date: new Date('2025-04-27'),
      path: 'assets/articles/firstBlogEntryExample.md'
    }
  ];

  constructor(private router: Router) { }

  showEntry(entry: BlogEntry) {
    const encodedPath = encodeURIComponent(entry.path);
    this.router.navigate(['/blog/entry'], { queryParams: { path: encodedPath } });
  }

}
