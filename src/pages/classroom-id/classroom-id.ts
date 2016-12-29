import {Component, Input, Output, EventEmitter} from '@angular/core';
import {NavController} from 'ionic-angular';
import {UserProvider} from '../../providers/user-provider';

@Component({
  selector: 'page-classroom-id',
  templateUrl: 'classroom-id.html'
})
export class ClassroomIdPage {
  @Input() parentPage: string;
  @Output() notify: EventEmitter<number> = new EventEmitter<number>();

  constructor(public navCtrl: NavController, public userService: UserProvider) {}

  //for testing purposes I will use 123 as the therapist ID
  //for testing purposes I will use 456 as the nurse ID
  //for testing purposes I will use 789 as the signout ID and signin ID
  checkUser(userID) {
    var id = Number(userID.value);
    
    //for async all the code needs to be in the .then() of this function
    //getUserByID takes a string and the input to .then() is a single java object that matches that id
    this.userService.getUserByID(userID.value).then((user: any) => {
     
      //I split up inputs so we can eventually look to see if each userId is authorized for the transaction
      //user.role can be used to identify permissions
      if(user.role === "therapist" && this.parentPage === 'therapy') {
        this.notify.emit(id);
      } else if(user.role === "nurse" && this.parentPage === 'nurse') {
        this.notify.emit(id);
      } else if(user.role === "driver" && this.parentPage === 'signout') {
        this.notify.emit(id);
      } else if(user.role === "driver" && this.parentPage === 'checkin') {
        this.notify.emit(id);
      } else {
        this.notify.emit(-1);
      }
      userID.value = '';
    });
    
    
  }

}
