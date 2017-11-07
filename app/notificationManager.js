
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
  self.notiMap = {};

  self.LoadFromNotifications = function(notifications){

  }

  
};


module.exports = NotificationObj;
