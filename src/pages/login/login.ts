import {Component} from "@angular/core";
import {NavController, NavParams, ToastController, LoadingController, AlertController, ModalController} from "ionic-angular";
import {ClassroomPage} from "../classroom/classroom";
import {KitchenPage} from "../kitchen/kitchen";
import {TherapistPage} from "../therapist/therapist";
import {AdminPage} from "../admin/admin";
import {ClassRoomProvider} from "../../providers/class-room-provider";
import {StudentProvider} from "../../providers/student-provider";
import {UserProvider} from "../../providers/user-provider";
import {CheckinProvider} from "../../providers/checkin-provider";
import {ConstantsProvider} from "../../providers/constants-provider";
import {LoggingProvider} from "../../providers/logging-provider";
import {ClassRoomModel} from "../../models/db-models";
import {UserLoginPage} from "../user-login/user-login";
import {ClassroomSelectionModalPage} from "../classroom-selection-modal/classroom-selection-modal";

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})

export class LoginPage {
  classroomPage = ClassroomPage;
  kitchenPage = KitchenPage;
  therapistPage = TherapistPage;
  adminPage = AdminPage;
  btnPage: string;
  room: any;
  classrooms: Array<ClassRoomModel>;

  constructor(public navCtrl: NavController, public toastCtrl: ToastController, public navParams: NavParams, public loadingcontroller: LoadingController,
              public classRoomService: ClassRoomProvider, public studentService: StudentProvider, public userService: UserProvider,
              public checkinService: CheckinProvider, public alertController: AlertController, constantsService: ConstantsProvider, public modalCtrl: ModalController
              ) {
    this.room = navParams.get('room');
    //try to estabilish an initial connection to db's
    this.classRoomService.forceInit();
    this.studentService.forceInit();
    this.userService.forceInit();
    let loader = loadingcontroller.create({
      content: "Loading your app now!",
      duration: 3000
    });
    loader.onDidDismiss(()=>{
      this.classRoomService.getAllClassRooms().then((data: Map<String, ClassRoomModel>) =>{
        this.classrooms = Array.from(data.values());
      });
    })
    loader.present();

    }

  ionViewDidEnter(){
    this.classRoomService.selectedClassroom = null;
    // this.classRoomService.getAllClassRooms().then((data) => {
    //   this.classrooms = <Array<ClassRoomModel>>data;
    // });
  }

  toLogin(userRole) {
    this.navCtrl.push(UserLoginPage, {parentPage: userRole});
  }

  selectClassroom(){
    let modal = this.modalCtrl.create(ClassroomSelectionModalPage);
    modal.onDidDismiss(data => {
      //this.navCtrl.pop();
    });
    modal.present(modal);
  }


}
