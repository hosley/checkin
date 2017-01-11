import {Component} from '@angular/core';
import {NavController, ToastController, NavParams} from 'ionic-angular';

@Component({
  selector: 'page-signout',
  templateUrl: 'signout.html'
})
export class SignoutPage {
  userID: number;
  roomNumber: string;

  constructor(public navCtrl: NavController, public toastCtrl: ToastController, public navParams: NavParams) {
    this.roomNumber = this.navParams.data;
  }

  onNotify(idCheck:number):void {
    if(idCheck >= 0) {
      this.userID = idCheck;
      var login = document.getElementById('enterIDSignout');
      login.style.display = 'none';
      var list = document.getElementById('studentListSignout');
      list.style.display = 'block';
    } else {
      let toast = this.toastCtrl.create({
        message: 'Incorrect ID',
        duration: 2000,
        position: 'bottom'
      });
      toast.present(toast);
    }
  }

  revert(students:Array<string>):void {
    var list = document.getElementById('studentListSignout');
    list.style.display = 'none';
    var login = document.getElementById('enterIDSignout');
    login.style.display = 'block';
    if(students[0] !== 'back') {
      let toast = this.toastCtrl.create({
        message: students.length + ' student(s) checked out!',
        duration: 2000,
        position: 'bottom'
      });
      toast.present(toast);
    }
  }

}
