
const electron = require('electron');
const app = electron.app;
const dialog = electron.dialog;
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const childProcess = require('child_process');
const async = require('async');
const pkgInfo = require('./package.json');

var NotificationObj = function() {
  var self = this;
  self.notificationsMap = {};
  self.currentDialogNotification = '';

  self.LoadFromNotifications = function(notifications) {

    self.notificationsMap = {};
    for (let i = 0; i < notifications.length; i++ ){
      let n = notifications[i];
      let flag = true;
      Object.keys(self.notificationsMap).forEach(function(k) {
        if (k === n.senderName) {
          flag = false;
          self.notificationsMap[k] = self.notificationsMap[k] + 1;
        }

      });
      if (flag) {
        self.notificationsMap[n.senderName] = 1;
      }
      
    }


    // console.log('notificationsMap:', self.notificationsMap);
    

  }


};


module.exports = NotificationObj;
