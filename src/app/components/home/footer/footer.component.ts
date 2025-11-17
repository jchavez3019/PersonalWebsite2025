import { Component } from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-footer',
  imports: [
    CommonModule,
    MatIcon
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  masterLastUpdated = new Date(environment.masterLastUpdated);
}
