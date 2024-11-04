// student-home.page.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-student-home',
  templateUrl: './student-home.page.html',
  styleUrls: ['./student-home.page.scss'],
})
export class StudentHomePage {
  courses = [
    { subject: 'Matemáticas', section: 'A' },
    { subject: 'Historia', section: 'B' },
    { subject: 'Ciencias', section: 'C' }
  ];
}
