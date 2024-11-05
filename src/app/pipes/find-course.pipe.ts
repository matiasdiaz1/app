import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'findCourse'
})
export class FindCoursePipe implements PipeTransform {

  transform(courses: any[], courseId: string): any {  // Cambia el tipo de courseId a string
    return courses.find(course => course.id === courseId);
  }
}
