import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeacherHomePageRoutingModule } from './teacher-home-routing.module';

import { TeacherHomePage } from './teacher-home.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeacherHomePageRoutingModule
  ],
  declarations: [TeacherHomePage]
})
export class TeacherHomePageModule {}
