import {Component} from '@angular/core';
import {NavController, ViewController, NavParams} from 'ionic-angular';
import {CheckinProvider} from '../../providers/checkin-provider';

@Component({
  selector: 'page-generic-checkin-confirm-modal',
  templateUrl: 'generic-checkin-confirm-modal.html'
})
export class GenericCheckinConfirmModalPage {
  nap_subtract: Number;
  student: String;
  userID: String;

  constructor(public navCtrl: NavController, private viewCtrl: ViewController, public navParams: NavParams, public checkinService: CheckinProvider) {
    this.student = this.navParams.get('student');
    this.userID = this.navParams.get('userID');
    this.nap_subtract = 0;
    console.log(this.student);
    console.log(this.userID);
  }

  submit() {
    this.checkinService.nurseCheckin(this.student.toString(), this.userID.toString());
    let data = { 'returnValue': true };
    this.viewCtrl.dismiss(data);
  }

}
