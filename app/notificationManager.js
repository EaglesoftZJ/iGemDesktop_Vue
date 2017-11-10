
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
const linq = require('Linq');

var NotificationObj = function() {
  var self = this;
  self.notificationsMap;
  self.currentDialogNotification = {};
  self.notificationWindow = null;
  self.showTime = 0;
  self.intervalId ;
  self.allowShow = true;

  self.init = (window) => {
    this.notificationWindow = window;
  }


  self.start = () => {
    this.notificationWindow.webContents.send('change-to-notification');
    intervalId = setInterval(() => {

      if (!this.allowShow) {
        this.clearShowTime();
      }
      
      if (this.notificationWindow )
        this.showTime = this.showTime - 1 <= 0 ? 0 : this.showTime - 1;
        if (this.showTime > 0) {
          console.log('showInactive:', this.notificationWindow.isVisible());
          
          if (!this.notificationWindow.isVisible()) {
            
            this.notificationWindow.showInactive();
            
          }

        } else {
          if (this.notificationWindow.isVisible()) {
            this.notificationWindow.hide();
          }

        }
    }, 1000);
  }

  self.stop = () => {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      intervalId = null;
    }
  }
  
  self.loadCurrentMessage = (message, username) => {
    this.notificationWindow.webContents.send('update-current-messages', {
      userName:username,
      text: message
    });
    self.addShowTime(6);
  }

  self.LoadFromNotifications = function(notifications) {

    // self.notificationsMap = {};
    // for (let i = 0; i < notifications.length; i++) {
    //   let n = notifications[i];
    //   let flag = true;
    //   Object.keys(self.notificationsMap).forEach(function(k) {
    //     if (k === n.senderName) {
    //       flag = false;
    //       self.notificationsMap[k] = self.notificationsMap[k] + 1;
    //     }

    //   });
    //   if (flag) {
    //     self.notificationsMap[n.senderName] = 1;
        
    //   }

    // }

    let keys = linq.from(notifications).select('$.senderName').reverse().distinct().toArray();

    let result = keys.map((k) => {
      return {
        userName: k,
        id: linq.from(notifications).first('$.senderName == "' + k + '"').sender,
        size: linq.from(notifications).count('$.senderName == "' + k + '"')
      }
    })
    console.log(result);

    this.notificationWindow.webContents.send('update-messages', result);


    

    self.addShowTime(6);


    console.log('notificationsMap:', self.notificationsMap);


  }



  self.addShowTime = (time) => {
    this.showTime = this.showTime + time > 6 ? 6 : this.showTime + time;
  }
  self.clearShowTime = () => {
    this.showTime = 0;
  }

  this.clear = () => {
    this.notificationsMap = {};
    this.currentDialogNotification = {};
    this.clearShowTime();

  }


};


module.exports = NotificationObj;
