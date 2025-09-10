import {Component} from '@angular/core';
import {MatChip, MatChipSet} from "@angular/material/chips";
import {MatDivider} from "@angular/material/divider";
import {MatIcon} from '@angular/material/icon';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatAnchor} from '@angular/material/button';

@Component({
  selector: 'app-home-content',
  imports: [
    MatChip,
    MatChipSet,
    MatDivider,
    MatIcon,
    RouterLink,
    RouterLinkActive,
    MatAnchor
  ],
  templateUrl: './home-content.component.html',
  styleUrl: './home-content.component.css'
})
export class HomeContentComponent {

}
