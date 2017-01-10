"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
//Pipe for if students have not been checked in
var signInPipe = (function () {
    function signInPipe() {
    }
    signInPipe.prototype.transform = function (value) {
        var returnArray = [];
        //console.log(value);
        value.forEach(function (student) {
            console.log(student.val);
            if (student.val.location === 'Checked out') {
                returnArray.push(student);
            }
        });
        return returnArray;
    };
    signInPipe = __decorate([
        core_1.Pipe({ name: 'signIn' })
    ], signInPipe);
    return signInPipe;
}());
exports.signInPipe = signInPipe;
