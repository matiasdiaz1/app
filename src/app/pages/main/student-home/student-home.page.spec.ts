import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StudentHomePage } from './StudentHomePage';

describe('StudentHomePage', () => {
  let component: StudentHomePage;
  let fixture: ComponentFixture<StudentHomePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentHomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
