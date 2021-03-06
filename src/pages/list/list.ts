import {Component, Input, Output, EventEmitter} from '@angular/core';
import {NavController, ToastController, NavParams, ModalController} from "ionic-angular";
import {StudentProvider} from '../../providers/student-provider';
import {CheckinProvider} from '../../providers/checkin-provider';
import {UserProvider} from '../../providers/user-provider';
import {ClassRoomProvider} from '../../providers/class-room-provider';
import {StudentDetailsPage} from '../student-details/student-details';
import {TherapistCheckinConfirmModalPage} from "../therapist-checkin-confirm-modal/therapist-checkin-confirm-modal"
import {GenericCheckinConfirmModalPage} from "../generic-checkin-confirm-modal/generic-checkin-confirm-modal";


@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  toastTrigger: boolean;
  studentID: string;
  count: number;
  selectedStudent: any;
  signoutStudents: Array<string> = new Array<string>();
  @Input() parentPage: string;
  @Input() userID: string;
  @Input() roomNumber: string;
  @Output() listCheckedOut: EventEmitter<string> = new EventEmitter<string>();
  @Output() removedStudents: EventEmitter<Array<string>> = new EventEmitter<Array<string>>();

  timeSinceLastInteraction: number = 0;
  interval: any;

  constructor(public studentService: StudentProvider, public navCtrl: NavController, public toastCtrl: ToastController, public modalCtrl: ModalController, public navParams: NavParams, public checkinService: CheckinProvider, public userService: UserProvider, public classroomService: ClassRoomProvider) {
    this.selectedStudent = navParams.get('student');
    this.parentPage = navParams.get('parentPage');
    this.userID = navParams.get('userID');
    this.roomNumber = navParams.get('roomNumber');
    console.log(navParams.get('count'))
    if ( navParams.get('count') === -1){
      this.count = 0;
    } else if (navParams.get('count')){
      this.count = navParams.get('count');
    }
    else {
      this.count = -1;
    }
    console.log(this.count);
    this.studentID = '';
    this.toastTrigger = false;
  }

/*******************************************************************************
 * resetInterval
 *
 * resets timeout
 *
 **/
  resetInterval() {
    this.timeSinceLastInteraction = 0;
  }

/*******************************************************************************
* revert
*
* Driver function of list. takes in a string which it receives from a button
* click in an instance of action-button and based on what the string says and
* what the parent page is performs a number of operations. If the parent page is
* therapist or generic the string can either be the studentID or the studentID
* and ' returned'. If it is only the studentID the student is checked out to the
* appropriate party, otherwise the student is returned to the classroom. If the
* parent page is checkin or signout then the string can be either the studentID
* or studentID + ' was returned'. If studentID is the string then the student
* will be added to an array. If studentID + ' was returned' is the string the
* student will be removed from the array. This array is then used by addStudents
* and removeStudents to perform the correct action based on the parent page.
*
**/
  revert(studentID:string):void {
    var search;
    if((this.parentPage !== 'signout') && (this.parentPage !== 'checkin')) {
      clearInterval(this.interval);
      this.studentID = studentID;
      var returnedStudent;
      if(this.parentPage === 'therapy') {
        search = studentID.search(' returned');
        if(search === -1) {
          //////////////////////////////////////////////////////////////////////
          //Checkout student to therapist
          //////////////////////////////////////////////////////////////////////
          console.log(this.userID);
          this.userService.getTherapistTypeByID(this.userID).then((type:string) => {
            this.checkinService.therapistCheckout(studentID, String(this.userID), type);
          }).catch(err => {
            this.checkinService.therapistCheckout(studentID, String(this.userID), "");
          });
          this.studentID = studentID;
          clearInterval(this.interval);
          this.navCtrl.pop();

        } else {
          //////////////////////////////////////////////////////////////////////
          //Checkin student to classroom from therapist
          //////////////////////////////////////////////////////////////////////
          returnedStudent = studentID.slice(0, search);
          this.checkinService.therapistCheckin(String(returnedStudent), String(this.userID)).then((t:any) => {
            this.followUpModal(t, String(returnedStudent));
            //this.checkinService.therapistCheckinFollowUp(String(returnedStudent), t.by_id, t.start_time, 60);
          });
          clearInterval(this.interval);
        }
      } else if(this.parentPage === 'generic') {
        search = studentID.search(' returned');
        if(search === -1) {
          //////////////////////////////////////////////////////////////////////
          //Checkout student to generic
          //////////////////////////////////////////////////////////////////////
          this.checkinService.nurseCheckout(studentID, String(this.userID));
          clearInterval(this.interval);
          this.navCtrl.pop();
        } else {
          //////////////////////////////////////////////////////////////////////
          //Checkin student to classroom from generic
          //////////////////////////////////////////////////////////////////////
          returnedStudent = studentID.slice(0, search);
          this.genericFollowUpModal(String(returnedStudent), String(this.userID));
          //clearInterval(this.interval);
        }
      }
      this.listCheckedOut.emit(studentID);
    } else {
      search = studentID.search(' was removed');
      if(search === -1) {
        ////////////////////////////////////////////////////////////////////////
        //add to checkin/checkout array
        ////////////////////////////////////////////////////////////////////////
        this.signoutStudents.push(studentID);
      } else {
        var deselectedStudentID = studentID.slice(0, search);
        var index = this.signoutStudents.indexOf(deselectedStudentID);
        if(index !== -1) {
          //////////////////////////////////////////////////////////////////////
          //add to checkin/checkout array
          //////////////////////////////////////////////////////////////////////
          this.signoutStudents.splice(index, 1);
        }
      }

    }
  }

/*******************************************************************************
* removeStudents
*
* takes the array of students (this.signoutStudents) and passes it to the
* checkoutService to check students out of the classroom. when this is done
* the students are emitted so that an accurate count of students can be
* toasted as checked out of the classroom.
*
**/
  removeStudents() {
    this.checkinService.checkoutStudents(this.signoutStudents, String(this.userID));
    this.removedStudents.emit(this.signoutStudents);
    this.toastTrigger = true;
    clearInterval(this.interval);
    this.navCtrl.pop();
  }

/*******************************************************************************
 * addStudents
 *
 * takes the array of students (this.signoutStudents) and passes it to the
 * checkinService to check students into the classroom. when this is done
 * the students are emitted so that an accurate count of students can be
 * toasted as checked into the classroom.
 *
 **/
  addStudents() {
    this.checkinService.checkinStudents(this.signoutStudents, String(this.userID));
    this.removedStudents.emit(this.signoutStudents);
    this.toastTrigger = true;
    clearInterval(this.interval);
    this.navCtrl.pop();
  }

/*******************************************************************************
 * isListEmpty
 *
 * Checks to see if the list the page has populated is empty to conditionally format
 * null list cases. Returns true if list is empty and false if list is populated
 *
 **/
  isListEmpty() {
    let isEmpty: boolean;
    isEmpty = true;
    if (this.parentPage === 'signout') {
      this.studentService.data.forEach(student => {
        if(student.location !== 'Checked out'){
          isEmpty = false;
        }
      });
    }
    if(this.parentPage === 'checkin') {
      this.studentService.data.forEach(student => {
        if(student.location === 'Checked out'){
          isEmpty = false;
        }
      });
    }
    if(this.parentPage === 'therapy') {
      this.studentService.data.forEach(student => {
        if(student.location === 'Therapist checked student out'){
          isEmpty = false;
        }else if(student.location !== 'Checked out' && student.location !==  'Therapist checked student out' && student.location !==  'Nurse checked student out'){
          isEmpty = false;
        }
      });
    }
    if(this.parentPage === 'generic') {
      this.studentService.data.forEach(student => {
        if(student.location === 'Nurse checked student out'){
          isEmpty = false;
        }else if(student.location !== 'Checked out' && student.location !==  'Therapist checked student out' && student.location !==  'Nurse checked student out'){
          isEmpty = false;
        }
      });
    }
    return isEmpty;
  }

/*******************************************************************************
* studentTapped
*
* Used to go to the StudentDetailsPage given a student
*
**/
  studentTapped(event, student) {
    clearInterval(this.interval);
    this.navCtrl.push(StudentDetailsPage, {
      student: student
    })
  }

/*******************************************************************************
* genericFollowUpModal
*
*
**/
  genericFollowUpModal(student, userID) {
    let modal = this.modalCtrl.create(GenericCheckinConfirmModalPage, {
      student: student,
      userID: userID
    }, {enableBackdropDismiss: false});
    modal.onDidDismiss(data => {
      this.navCtrl.pop();
    });
    modal.present(modal);
  }


/*******************************************************************************
* followUpModal
*
* called from inside revert, this function creates the modal for therapists to
* state when exactly they checked students out for therapy and how long the
* session was.
*
**/
  followUpModal(TransactionTherapyObject, student) {
    let modal = this.modalCtrl.create(TherapistCheckinConfirmModalPage, {
      start_time: TransactionTherapyObject.start_time,
      length: (Math.round(Number(Date.now() - TransactionTherapyObject.start_time) / 900000) * 900000)/60000,
      by_id: TransactionTherapyObject.by_id,
      student: student
    }, {enableBackdropDismiss: false});
    modal.onDidDismiss(data => {
      this.navCtrl.pop();
    });
    modal.present(modal);
  }

  ionViewWillLeave() {
    this.timeSinceLastInteraction = 25;

    var output = '';
    switch(this.parentPage) {
      case 'checkin':
        output = this.signoutStudents.length !== 0 && this.toastTrigger === true ? this.signoutStudents.length + ' student(s) have been checked in' : '';
        this.signoutStudents.length = 0;
        break;
      case 'signout':
        output = this.signoutStudents.length !== 0 && this.toastTrigger === true ? this.signoutStudents.length + ' student(s) have been checked out' : '';
        this.signoutStudents.length = 0;
        break;
      case 'therapy':
        if (this.studentID !== '') {
          if(this.studentID.search(' returned') === -1) {
            output = this.studentService.data.get(this.studentID).fName.toString() + ' is off to therapy';
          }
          else {
            output = this.studentService.data.get(this.studentID.slice(0, this.studentID.search(' returned'))).fName.toString() + ' has returned from therapy';
          }
        }
        break;
      case 'generic':
        if (this.studentID !== '') {
          if(this.studentID.search(' returned') === -1) {
            output = this.studentService.data.get(this.studentID).fName.toString() + ' is checked out by ' + this.userService.data.get(String(this.userID)).fName + " " +  this.userService.data.get(String(this.userID)).lName;
          }
          else {
            output = this.studentService.data.get(this.studentID.slice(0, this.studentID.search(' returned'))).fName.toString() + ' has returned';
          }
        }
        break;
      default:
        break;
    }
    if(output !== '') {
      let toast = this.toastCtrl.create({
        message: output,
        duration: 2000,
        position: 'bottom'
      });
      toast.present(toast);
    }
  }


  ionViewWillUnload(){
    clearInterval(this.interval);
  }

  ionViewWillEnter(){
    this.timeSinceLastInteraction = 0;
    if(this.interval){
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      if(++this.timeSinceLastInteraction >= 30){
        clearInterval(this.interval);
        // switch back from this page, nuke it, kill it with fire
        this.navCtrl.popToRoot();
      }
    }, 1000)
  }

  ionViewDidEnter(){
    console.log("the list page has been made the focus with a parent page of "+ this.parentPage);
    console.log("the user id is: " + this.userID);
    console.log("the room number is " + this.roomNumber);
  }

}
