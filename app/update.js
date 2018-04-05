
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

var UpdateObj = function() {
  var self = this;

  self.name = pkgInfo.name;
  self.version = pkgInfo.version;
  self.platform = os.platform();
  self.arch = os.arch();

  self.feedURL = '';
  self.updateURL = '';
  self.updateVer = '';
  self.updateMD5 = '';
  self.updatePath = '';
  self.updateTmpPath = '';
  self.contentLength = 0;
  self.receivedLength = 0.00;
  self.updateDetialResult = null;

  self.getVerNum = function(ver) {
    var verArr = ver.split('.');
    var num = 0;
    num += parseInt(verArr[0]) * 1000 * 1000;
    num += parseInt(verArr[1]) * 1000;
    num += parseInt(verArr[2]);
    return num;
  };

  self.cleanup = function(ver) {
    var needCleanup = false;
    var curVer = self.getVerNum(self.version);
    var fileVer = self.getVerNum(ver);

    if (fileVer <= curVer) {
      needCleanup = true;
    }

    return needCleanup;
  };

  self.updateButtons = [];
  self.updateMessage = '发现新版本, 点击"重启升级"后即可完成升级!';

  if (self.platform === 'win32') {
    self.updateButtons = ['重启升级', '取消'];
    self.updateResponse = 0;

    self.appDataDir = path.join(process.env.APPDATA, pkgInfo.name);
  }
  else if (self.platform === 'darwin') {
    self.updateButtons = ['取消', '重启升级'];
    self.updateResponse = 1;

    self.appDataDir = path.join(process.env.HOME, '/Library/Application Support', pkgInfo.name);
  }
  else {
    // null
  }

  if (!fs.existsSync(self.appDataDir)) {
    fs.mkdirSync(self.appDataDir);
  }

  var files = fs.readdirSync(self.appDataDir);
  files.forEach(function(file) {
    var filePath = path.join(self.appDataDir, file);

    if (/^update_v([\d.]+)\.(exe|zip)$/.test(file)) {
      var exeVersion = path.basename(file, path.extname(file)).split('_v')[1];

      if (self.cleanup(exeVersion)) {
        fs.unlink(filePath, (err) => { });
      }
      else {
        self.updatePath = filePath;
      }
    }

    if (/^temp_v([\d.]+)\.(exe|zip)$/.test(file)) {
      fs.unlink(filePath, (err) => { });
    }
  });

  self.setFeedURL = function(url) {
    self.feedURL = url;
  };

  self.getFeedURL = function() {
    return self.feedURL;
  };

 

  self.checkUpdate = function(window, noti) {
    var url = self.feedURL
    let osType;
    if (self.platform == 'darwin') {
      osType = 'mac';
    } else {
      if (self.arch === 'x64'){
        osType = '64';
      } else {
        osType = '32';
      }
    }
    var soap = require('soap');
    var args = { version: pkgInfo.version, winType: osType };
    // var args = { version: '1.0.1', winType: osType };
    soap.createClient(url, function(err, client) {
      if (client) {
        client.updateFlyChat(args, function(err, result) {
          var parsedData = JSON.parse(result.return);
          self.updateURL = parsedData.url;
          self.updateVer = parsedData.version;
          console.log(parsedData);

          if (parsedData.canUpdate) {
            window.webContents.send('change-to-update');
            window.showInactive();
          } else {
            noti.start();
          }
        });
      }

    });
  }
  self.getUpdateDetial = function(winstance) {
    // 获取日志数据
    var soap = require('soap');
    soap.createClient('http://61.175.100.14:8012/ActorServices-Maven/services/ActorService?wsdl', function(err, client) {
        if (client) {
            client.selectGxrz({type: '1'}, (err, result) => {
                self.updateDetialResult = result;
                winstance.webContents.send('receiveUpdateDetail', self.updateDetialResult);
            });
        }
    });
  }

  self.startUpdate = function(window) {
    window.webContents.send('start-to-update');
    http.get(self.updateURL, function(response) {
      var statusCode = response.statusCode;
      var contentType = response.headers['content-type'];
      self.contentLength = parseInt(response.headers['content-length']);
      console.log(self.contentLength);
      if (statusCode != 200) {

      }
      else {
        var downloadFlag = false;

        if (self.updateURL.endsWith('dmg')) {
          self.updateTmpPath = path.join(self.appDataDir, `temp_v${self.updateVer}.dmg`);
          self.updatePath = path.join(self.appDataDir, `update_v${self.updateVer}.dmg`);
        } else {
          self.updateTmpPath = path.join(self.appDataDir, `temp_v${self.updateVer}.exe`);
          self.updatePath = path.join(self.appDataDir, `update_v${self.updateVer}.exe`);
        }

        
        downloadFlag = true;


        if (downloadFlag) {

          response.pipe(fs.createWriteStream(self.updateTmpPath));

          response.on('data', (chunk) => {
            self.receivedLength += chunk.length;
            window.webContents.send('update-progress',self.receivedLength/self.contentLength *100);
          });


          response.on('end', function() {
            fs.renameSync(self.updateTmpPath, self.updatePath);
            console.log('finish');
            console.log(self.updatePath);
          });
        }
      }
    })
  }
  self.quitAndInstall = function() {
    var exec = childProcess.exec;
    if (self.platform === 'win32') {
      if (fs.existsSync(self.updatePath)) {

        exec(`start ${self.updatePath} `, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            return;
          }
          app.exit(0);
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
        });
        setTimeout(function() {
          app.exit(0);
        }, 5000);
      }
      else {
        dialog.showErrorBox('升级失败', '升级程序已损坏,请重新下载完整程序安装');
      }
    }
    else if (self.platform === 'darwin') {
      exec(`open ${self.updatePath.replace(' ','\\ ')} `, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        app.exit(0);
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
      });
      app.exit(0);
      // unzip.on('exit', function() {
      //   exec(`rm '${self.updatePath}'`);
      //   app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
      //   app.exit(0);
      // });
    }
    else {
      // null
    }
  };
};


module.exports = UpdateObj;
