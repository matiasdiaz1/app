import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeacherHomePageRoutingModule } from './teacher-home-routing.module';

import { TeacherHomePage } from './teacher-home.page';
import { SharedModule } from "../../../shared/shared.module";
import { FindCoursePipe } from 'src/app/pipes/find-course.pipe'; // Ruta al archivo del pipe

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeacherHomePageRoutingModule,
    SharedModule
],
  declarations: [TeacherHomePage, FindCoursePipe]
})
export class TeacherHomePageModule {}
