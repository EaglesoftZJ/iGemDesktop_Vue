
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
const linq = require('linq');

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
    this.intervalId = setInterval(() => {

      if (!this.allowShow) {
        this.clearShowTime();
      }
      
      if (this.notificationWindow )
        this.showTime = this.showTime - 1 <= 0 ? 0 : this.showTime - 1;
      if (this.showTime > 0) {
        // console.log('showInactive:', this.notificationWindow.isVisible());
        
        if (!this.notificationWindow.isVisible()) {
          
          this.notificationWindow.showInactive();
          
        }

      } else {
        if (this &&this.notificationWindow && this.notificationWindow.isVisible()) {
          this.notificationWindow.hide();
          this.notificationWindow.webContents.send('update-current-messages', {});
        }

      }
    }, 1000);
  }

  self.stop = () => {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  self.loadCurrentMessage = (obj) => {
    // console.log('obj', obj);
    this.notificationWindow.webContents.send('update-current-messages', obj);
    self.addShowTime(6);
  }

  self.LoadFromNotifications = function(notifications, type) {

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

    // let keys = linq.from(notifications).select('$.senderName').reverse().distinct().toArray();

    // let result = keys.map((k) => {
    //   return {
    //     userName: k,
    //     id: linq.from(notifications).first('$.senderName == "' + k + '"').sender,
    //     size: linq.from(notifications).count('$.senderName == "' + k + '"')
    //   }
    // })

     let result = notifications.map((item) => {
      return {
        userName: item.peer.title,
        id: item.peer.peer.key,
        size: item.counter,
        avatar: item.peer.avatar,
        placeholder: item.peer.placeholder,
      }
    })
    // console.log(result);

    this.notificationWindow.webContents.send('update-messages', result);
    if (type === 'show') {
      self.addShowTime(6);
    }
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
