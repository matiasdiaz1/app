import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-attendance-modal',
  templateUrl: './attendance-modal.component.html',
  styleUrls: ['./attendance-modal.component.scss'],
})
export class AttendanceModalComponent {
  @Input() course: any;

  constructor(private modalController: ModalController) {}

  close() {
    this.modalController.dismiss();
  }
}
