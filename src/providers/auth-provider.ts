import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import {UserModel} from '../models/db-models';

import { LoggingProvider } from './logging-provider';
import { UtilityProvider } from './utility-provider';

let crypto;
try {
  crypto = require('crypto');
} catch (err) {
  console.log('crypto support is disabled!');
}

@Injectable()
export class AuthProvider {
  hashdb: any;
  hashRemote: String;


  constructor(public loggingService: LoggingProvider,
              public utilityService: UtilityProvider) {

    // this.hashdb = new PouchDB('hashes');
    // this.hashRemote = 'https://christrogers:christrogers@christrogers.cloudant.com/authentication';
    // this.hashRemote = 'http://localhost:5984/authentication';
    // this.hashRemote = 'http://chris:couchdbadmin5@104.197.130.97:5984/authentication';
    // let options = {
    //   live: true,
    //   retry: true,
    //   continuous: true
    // };
    //
    // this.hashdb.sync(this.hashRemote, options);
    //pouchdb interface for a remote couchdb, no syncing involved, ?only uses http to directly get from the remote db?
    let credentials = utilityService.returnCredentialObject();
    if(credentials && credentials.username){
      this.hashdb = new PouchDB('http://104.197.232.119:5984/authentication', {
        ajax: {

        },
        auth: {
          username: credentials.username,
          password: credentials.password
        }
      });
    } else {
      alert('refresh this page, something went wrong');
    }
  }

  forceInit(){
  }

  checkPassword(id: string, password:string){
    return new Promise((resolve, reject) => {
      console.log("Checking: " + id + " " + password);
      this.hashdb.get(id+"").then((result) => {
        console.log(result);
        //what happens if there is no entry for this id?
        let salt = result.salt;
        let sha = result.passwordHash;

        let created = this.sha256(password, salt);
        if(created.passwordHash === sha){
          //accept
          resolve(true);
        }else{
          resolve(false);
        }
      }).catch(err => {
        console.log(err);
        reject();
      });

    });
  }

  setPassword(id: string, password: string){
    return new Promise((resolve, reject) => {
      this.hashdb.upsert(id, (doc) => {
        let out =  this.sha256(password, this.generateSALT(16));
        doc.salt = out.salt;
        doc.passwordHash = out.passwordHash;
        console.log(doc);
        return doc;
      }).then((result) => {
        this.loggingService.writeLog(`Password set for user with ID: ${id}`);
        resolve();
      }).catch(err => {
        console.log(err);
        reject();
      });

    });
  }

  //DELETE FUNCTION?
  deletePasswordByDoc(user: any){
    return new Promise(resolve =>{
      this.hashdb.upsert(user._id, ((doc)=>{doc._deleted=true; return doc})).then(() => {
        //write to logging
        this.loggingService.writeLog(`Password data deleted for user with ID: ${user._id}`);
        resolve();
      })
    })
  }

  deletePasswordByID(ID: String){
    this.hashdb.get(ID).then(doc => {
      this.deletePasswordByDoc(doc);
    }).catch(err => {
      console.log(err)
    });
  }

  //basically a random hex string of length
  generateSALT(length: number){
    var s = "";
    var choices = "abcdefABCDEF0123456789"
    for(var i = 0; i < length; i++){
      var index = Math.floor(Math.random()*choices.length);
      s+= choices.charAt(index);
    }
    return s;
  }

  sha256(password, salt){
    var hash = crypto.createHmac('sha256', salt).update(password);
    var value = hash.digest('hex');
    return {
      salt:salt,
      passwordHash: value
    }
  }

  setPasswordQuestion(id: string, question: string, answer: string){
    return new Promise((resolve, reject) => {
      this.hashdb.upsert(id, (doc) => {
        console.log(doc);
        let out =  this.sha256(answer, this.generateSALT(16));
        doc.question = question;
        doc.questionSalt = out.salt;
        doc.answerHash = out.passwordHash;
        console.log(doc);
        return doc;
      }).then((result) => {

        this.loggingService.writeLog(`Password question set for user with ID: ${id}`);
        resolve();
      }).catch(err => {
        console.log(err);
        reject();
      });

    });
  }

  getPasswordQuestion(id: string){
    return new Promise((resolve, reject) => {
      this.hashdb.get(id + "").then((result) => {
        if(result.question){
          resolve(result.question);
        }else{
          reject("Question not set");
        }
      });
    })
  }

  checkPasswordQuestion(id: string, answer: string){
    return new Promise((resolve, reject) => {
      console.log("Checking: " + id + " " + answer);
      this.hashdb.get(id+"").then((result) => {
        console.log(result);
        //what happens if there is no entry for this id?
        let salt = result.questionSalt;
        let sha = result.answerHash;

        let created = this.sha256(answer, salt);
        if(created.passwordHash === sha){
          //accept
          resolve(true);
        }else{
          resolve(false);
        }
      }).catch(err => {
        console.log(err);
        reject();
      });

    });
  }
}
