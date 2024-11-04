import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherHomePage } from './teacher-home.page';

describe('TeacherHomePage', () => {
  let component: TeacherHomePage;
  let fixture: ComponentFixture<TeacherHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
