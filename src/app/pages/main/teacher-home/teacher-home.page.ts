// teacher-home.page.ts
import { Component } from '@angular/core';


@Component({
  selector: 'app-teacher-home',
  templateUrl: './teacher-home.page.html',
  styleUrls: ['./teacher-home.page.scss'],
})
export class TeacherHomePage {
  courses = [
    { subject: 'Matemáticas', section: 'A' },
    { subject: 'Historia', section: 'B' },
    { subject: 'Ciencias', section: 'C' }
  ];
}
