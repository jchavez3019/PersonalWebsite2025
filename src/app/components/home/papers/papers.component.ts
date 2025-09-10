import { Component } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {MatCardModule} from '@angular/material/card';
import {MatAnchor} from '@angular/material/button';

interface Paper {
  title: string;
  authors: {
    name: string;
    url: string;
    contribution: 'equal' | '';
  }[];
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
      title: "Guaranteed Bounding Meshes Extraction from Neural " +
        "Implicit Surfaces via Neural Network Verification",
      authors: [
        {
          name: 'Jorge Chavez',
          url: 'https://www.jorgechavezuiuc.com/',
          contribution: 'equal',
        },
        {
          name: 'Ruize Gao',
          url: 'https://www.linkedin.com/in/ruize-gao-199b0b18b/',
          contribution: 'equal',
        },
        {
          name: 'Xiangru Zhong',
          url: 'https://scholar.google.com/citations?user=ltuTQBIAAAAJ&hl=zh-CN',
          contribution: 'equal',
        },
        {
          name: 'Huan Zhang',
          url: 'https://www.huan-zhang.com/',
          contribution: '',
        },
        {
          name: 'Shenlong Wang',
          url: 'https://shenlong.web.illinois.edu/',
          contribution: '',
        }
      ],
      journal: "International Conference on Learning Representations (ICLR) [Under Review]",
      year: 2025,
      abstract: "Geometric queries on neural implicit surfaces can be converted to neural verification\n" +
        "problems that seek to prove certain properties of the queried neural implicit. State-\n" +
        "of-the-art neural verification tools are capable of providing refined solutions to such\n" +
        "problems through complex behaviors and at a high computational costs, but we find\n" +
        "that a handful of linear bound propagation verifiers can be adapted to solve them\n" +
        "in real-time, such as rendering and physics simulation. Instead of running neural\n" +
        "verifiers on the fly, we can classify a 3D input domain into multiple regions of\n" +
        "interest, which can assist in subsequent verifications. We achieve this objective by\n" +
        "constructing explicit bounding volumes. Fortunately, tight linear bounds generated\n" +
        "by SOTA neural network verifiers can be leveraged to guide the generation of\n" +
        "piecewise linear meshes. In this paper, we propose Guaranteed Inner-and-Outer\n" +
        "Meshes (GIOM), which can serve as bounding volumes and merge seamlessly with\n" +
        "existing explicit geometry processors to accelerate queries on neural implicits. As\n" +
        "tight and sound bounding meshes, GIOM enables accelerated neural SDF queries\n" +
        "without sacrificing quality. With GIOM, we develop accelerated neural implicit\n" +
        "ray casting, collision detection, and constructive solid geometry methods (CSG),\n" +
        "achieving up to a 300% speedup in real-time rendering, a 500% speedup in physics\n" +
        "simulation, and an optimization-free neural CSG procedure. Experiments show that\n" +
        "GIOS significantly outperforms existing methods in the speed–quality trade-off.",
    },
    {
      title: "Clip-and-Verify: Linear Constraint-Driven Domain Clipping for Accelerating Neural Network Verification",
      authors: [
        {
          name: 'Jorge Chavez',
          url: 'https://www.jorgechavezuiuc.com/',
          contribution: 'equal',
        },
        {
          name: 'Duo Zhou',
          url: 'https://www.duo-zhou.com/',
          contribution: 'equal',
        },
        {
          name: 'Hesun Chen',
          url: 'https://www.linkedin.com/in/hesun-chen-495b7633b',
          contribution: 'equal',
        },
        {
          name: 'Huan Zhang',
          url: 'https://www.huan-zhang.com/',
          contribution: '',
        },
        {
          name: 'Grani Adiwena Hanasusanto',
          url: 'http://grani.hanasusanto.com/',
          contribution: '',
        },
      ],
      journal: "Conference on Neural Information Processing Systems (NeurIPS) [Under Review]",
      year: 2025,
      abstract: "State-of-the-art neural network verifiers demonstrate that applying the branch-and-\n" +
        "bound (BaB) procedure with fast bounding techniques plays a key role in tackling\n" +
        "many challenging verification properties. In this work, we introduce the linear\n" +
        "constraint-driven clipping framework, a class of scalable and efficient methods\n" +
        "to enhance bound propagation verifiers. Under this framework, we develop two\n" +
        "novel algorithms that efficiently utilize linear constraints to 1) reduce portions of\n" +
        "the input space that are either verified or irrelevant to a subproblem in the context\n" +
        "of branch-and-bound, and 2) directly improve intermediate bounds throughout\n" +
        "the network. The process novelly uses linear constraints that are readily available\n" +
        "during verification but not fully utilized in prior work. It efficiently handles linear\n" +
        "constraints using a specialized procedure that can scale to large neural networks\n" +
        "that the latest verifiers can handle without using any expensive external solvers.\n" +
        "Our verification algorithm, Clip-and-Verify, tightens bounds globally and can\n" +
        "significantly reduce the number of subproblems handled during BaB. We show\n" +
        "our clipping procedures can intuitively and efficiently be incorporated into BaB-\n" +
        "based verifiers such as α,β-CROWN, and is amenable to BaB procedures that\n" +
        "split upon the input or activation space. We demonstrate the effectiveness of our\n" +
        "procedure on a broad range of benchmarks where, in some instances, we witness a\n" +
        "96% reduction in the number of subproblems during branch-and-bound, and also\n" +
        "achieve state-of-the-art verified accuracy across multiple benchmarks.",
    },
    {
      title: "A Linear Constraint Driven Approach to Efficiently Enhancing Branch and Bound in Neural Network Verification",
      authors: [
        {
          name: 'Jorge Chavez',
          url: 'https://www.jorgechavezuiuc.com/',
          contribution: '',
        },
      ],
      journal: "Master’s Thesis, Graduate College of the University of Illinois Urbana-Champaign",
      year: 2025,
      abstract: "The verification of neural network systems is crucial as the adoption of these systems are considered for\n" +
        "safety-critical tasks. A neural network system that works empirically well may not be robust, and when\n" +
        "employed in areas such as cyber-security and cyber-physical systems, the guaranteed performance is a\n" +
        "must. Formal verification is a rapidly growing field that delves into providing these guarantees, ensuring\n" +
        "that properties on these networks can be assured. This thesis serves as an introduction into the common\n" +
        "techniques used to provide such guarantees. There is a particular focus on bound propagation techniques as\n" +
        "such techniques have fueled state-of-the-art, efficient verifiers. After covering the many advances that have\n" +
        "been made in neural network verification, we will delve further into the branch-and-bound paradigm that\n" +
        "typically accompanies many existing verifiers, as well as demonstrate an insightful algorithm that is capable\n" +
        "of garnering further efficacy from bound propagation verifiers.",
    },
    // Add more papers as needed
  ];

  // Contains the indices of papers whose abstract should be expanded.
  expandedAbstracts: Set<number> = new Set<number>();

  /**
   * Toggles whether a paper's abstract should be expanded or not.
   * @param index -- Integer index into the list of papers.
   */
  toggleAbstract(index: number) {
    if (this.expandedAbstracts.has(index)) {
      this.expandedAbstracts.delete(index);
    } else {
      this.expandedAbstracts.add(index);
    }
  }

  /**
   * Returns boolean of whether a paper has its abstract expanded.
   * @param index -- Integer index into the list of papers.
   */
  isExpanded(index: number): boolean {
    return this.expandedAbstracts.has(index);
  }

  /**
   * Truncates a paper's abstract if it should be truncated.
   * @param text  -- Abstract text.
   * @param limit -- Character limit to truncate towards.
   */
  getTruncatedAbstract(text: string, limit = 350): string {
    if (text.length <= limit) return text;
    return text.slice(0, limit) + '...';
  }

  /**
   * Returns whether the equal contribution tag needs to be inserted for a paper.
   * @param index -- Integer index into the list of papers.
   */
  hasEqualContributors(index: number): boolean {
    return this.papers[index].authors.some((author: {name: string, url: string, contribution: string}) => {
      return author.contribution === 'equal';
    });
  }
}
