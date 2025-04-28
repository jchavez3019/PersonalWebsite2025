import { Component } from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {MatDivider} from '@angular/material/divider';
import {MatChip, MatChipSet} from '@angular/material/chips';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatIcon,
    MatDivider,
    MatChip,
    MatChipSet,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
