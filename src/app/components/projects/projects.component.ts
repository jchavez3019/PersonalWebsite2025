import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatChipsModule} from '@angular/material/chips';


interface Project {
  title: string;
  description: string;
  image: string;
  technologies: string[];
  link?: string;
  video?: string;
  pdf?: string;
  github?: string;
}

@Component({
  selector: 'app-projects',
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
  ],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent {
  projects: Project[] = [
    {
      title: 'Project One',
      description: 'A brief description of your first project and what it accomplishes.',
      image: 'assets/project.png',
      technologies: ['Angular', 'TypeScript', 'Material UI'],
      // link: 'https://project-one.example.com',
      github: 'https://github.com/yourusername/project-one'
    },
    {
      title: 'Project Two',
      description: 'A brief description of your second project and what it accomplishes.',
      image: 'assets/project.png',
      technologies: ['React', 'Node.js', 'MongoDB'],
      link: 'https://project-two.example.com',
      github: 'https://github.com/yourusername/project-two'
    },
    {
      title: 'ECE 484: Principles of Safe Autonomy Lane Tracking',
      description: 'A complete vision-based solution for autonomous lane tracking. This project combined computer vision and control system techniques with an implementation deployed on the campus GEM vehicle.',
      image: 'assets/GEM-isometric.jpg',
      technologies: ['Vue.js', 'Firebase', 'TailwindCSS'],
      video: 'https://youtu.be/Zc9iKM_Oca8?si=rgICaBTXz6osFEx8',
      github: 'https://github.com/yourusername/project-three'
    },
    {
      title: 'Photo Cluster: Automated Face Recognition',
      description: 'An automated face recognition algorithm developed around clustering techniques for efficient image grouping.',
      image: 'assets/CS549PhotoClusterCover.png',
      technologies: ['Python', 'PyTorch'],
      pdf: './assets/project_pdfs/CS 549 Final Project Report.pdf',
      github: 'https://github.com/yourusername/project-three'
    }
    // Add more projects as needed
  ];
}
