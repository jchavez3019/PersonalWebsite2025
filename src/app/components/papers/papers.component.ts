import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatAnchor} from '@angular/material/button';

interface Paper {
  title: string;
  authors: string;
  journal: string;
  year: number;
  abstract: string;
  link?: string;
  doi?: string;
}

@Component({
  selector: 'app-papers',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatAnchor
  ],
  templateUrl: './papers.component.html',
  styleUrl: './papers.component.css'
})
export class PapersComponent {
  papers: Paper[] = [
    {
      title: 'Title of Your First Paper',
      authors: 'Your Name, Co-author Name',
      journal: 'Journal of Something Important',
      year: 2023,
      abstract: 'This is the abstract of your first paper. It should summarize the research, methodology, and findings in a concise manner.',
      link: 'https://example.com/paper1',
      doi: '10.1234/example.1234'
    },
    {
      title: 'Title of Your Second Paper',
      authors: 'Your Name, Another Co-author',
      journal: 'International Conference on Something',
      year: 2022,
      abstract: 'This is the abstract of your second paper. It should summarize the research, methodology, and findings in a concise manner.',
      link: 'https://example.com/paper2',
      doi: '10.1234/example.5678'
    },
    {
      title: 'Title of Your Third Paper',
      authors: 'Your Name, Multiple Co-authors',
      journal: 'Journal of Advanced Research',
      year: 2021,
      abstract: 'This is the abstract of your third paper. It should summarize the research, methodology, and findings in a concise manner.',
      link: 'https://example.com/paper3',
      doi: '10.1234/example.9012'
    }
    // Add more papers as needed
  ];
}
