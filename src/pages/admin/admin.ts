import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {AdminStudentTabPage} from "../admin-student-tab/admin-student-tab";
import {AdminUserTabPage} from "../admin-user-tab/admin-user-tab";
import {AdminDebugTabPage} from "../admin-debug-tab/admin-debug-tab";
import {AdminClassroomTabPage} from "../admin-classroom-tab/admin-classroom-tab";

@Component({
  selector: 'page-admin',
  templateUrl: 'admin.html'
})
export class AdminPage {
  adminStudentTab = AdminStudentTabPage;
  adminStudentTabParams = {

  };

  adminUserTab = AdminUserTabPage;
  adminUserTabParams = {

  };

  adminDebugTab = AdminDebugTabPage;
  admingDebugTabParams = {

  };

  adminClassroomTab = AdminClassroomTabPage;
  admingClassroomTabParams = {

  };

  constructor(public navCtrl: NavController) {}



}
