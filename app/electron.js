const electron = require('electron');
const path = require('path');

const { app, Menu, Tray, ipcMain, BrowserWindow, dialog } = require('electron');


let mainWindow;
let updateWindow;
let notificationWindow;

let blinkTrayFlag = false;
let isMacOS = (process.platform === 'darwin');

let updateUrl;
let config = {};

let trayPath = 'tray';
if (isMacOS) {
  trayPath = 'mac_' + trayPath;
}
const iconPath = path.join(__dirname, './icons/' + trayPath + '.png');
const blinkIconPath = path.join(__dirname, './icons/' + trayPath + '_blink.png');


let willQuitApp = false;
let update;
let notification;
var Base64 = {
  
  // private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  
  // public method for encoding
  encode : function (input) {
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;
  
      input = Base64._utf8_encode(input);
  
      while (i < input.length) {
  
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);
  
          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;
  
          if (isNaN(chr2)) {
              enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
              enc4 = 64;
          }
  
          output = output +
          this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
          this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
  
      }
  
      return output;
  },
  
  // public method for decoding
  decode : function (input) {
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;
  
      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  
      while (i < input.length) {
  
          enc1 = this._keyStr.indexOf(input.charAt(i++));
          enc2 = this._keyStr.indexOf(input.charAt(i++));
          enc3 = this._keyStr.indexOf(input.charAt(i++));
          enc4 = this._keyStr.indexOf(input.charAt(i++));
  
          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;
  
          output = output + String.fromCharCode(chr1);
  
          if (enc3 != 64) {
              output = output + String.fromCharCode(chr2);
          }
          if (enc4 != 64) {
              output = output + String.fromCharCode(chr3);
          }
  
      }
  
      output = Base64._utf8_decode(output);
  
      return output;
  
  },
  
  // private method for UTF-8 encoding
  _utf8_encode : function (string) {
      string = string.replace(/\r\n/g,"\n");
      var utftext = "";
  
      for (var n = 0; n < string.length; n++) {
  
          var c = string.charCodeAt(n);
  
          if (c < 128) {
              utftext += String.fromCharCode(c);
          }
          else if((c > 127) && (c < 2048)) {
              utftext += String.fromCharCode((c >> 6) | 192);
              utftext += String.fromCharCode((c & 63) | 128);
          }
          else {
              utftext += String.fromCharCode((c >> 12) | 224);
              utftext += String.fromCharCode(((c >> 6) & 63) | 128);
              utftext += String.fromCharCode((c & 63) | 128);
          }
  
      }
  
      return utftext;
  },
  
  // private method for UTF-8 decoding
  _utf8_decode : function (utftext) {
      var string = "";
      var i = 0;
      var c = c1 = c2 = 0;
  
      while ( i < utftext.length ) {
  
          c = utftext.charCodeAt(i);
  
          if (c < 128) {
              string += String.fromCharCode(c);
              i++;
          }
          else if((c > 191) && (c < 224)) {
              c2 = utftext.charCodeAt(i+1);
              string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
              i += 2;
          }
          else {
              c2 = utftext.charCodeAt(i+1);
              c3 = utftext.charCodeAt(i+2);
              string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
              i += 3;
          }
  
      }
  
      return string;
  }
}

if (!!process.env.NODE_ENV) {
  // null
}
else {
  process.env.NODE_ENV = 'production';
}

// if (process.env.NODE_ENV === 'developmentHot') {
//   config = require('../config');
//   config.url = `http://localhost:3000`;
// }
// else 

if (process.env.NODE_ENV === 'developmentHot') {
  config = require('../config');
  updateUrl = `http://localhost:${config.port}/`;
}
else {
  config.devtron = false;

  updateUrl = 'file://' + path.join(__dirname, './dist/index.html');
}
// config.url = `http://61.175.100.14:5433/`;
config.url = 'http://localhost:3000/';
// config.url = 'http://220.189.207.18:3000/';


// 主程序初始化
function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    minHeight: 700,
    minWidth: 1000,
    width: 1000,
    height: 700
  });

  let screenWidth = electron.screen.getPrimaryDisplay().workAreaSize.width;
  let screenHeight = electron.screen.getPrimaryDisplay().workAreaSize.height;

  // let width = 320;
  // let height = 130;
  let width = 260;
  let height = 163;
  let offsetX = 340;

  let offSetY = height + 10;

  if (isMacOS) {
    offsetX = -2000;
    offSetY = -2000;
  }

  updateWindow = new BrowserWindow({
    frame: false,
    width: width,
    height: height,
    x: screenWidth - offsetX,
    y: screenHeight - offSetY,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false
  });

  

  updateWindow.hide();


  updateWindow.loadURL(updateUrl);

  mainWindow.loadURL(config.url);

  const UpdateObj = require('./update');

  const NotificationObj = require('./notificationManager');
  update = new UpdateObj();
  notification = new NotificationObj();
  update.setFeedURL('http://61.175.100.14:8012/ActorServices-Maven/services/ActorService?wsdl');
  // update.setFeedURL('http://192.168.1.182:8080/services/ActorService?wsdl');


  updateWindow.webContents.on('dom-ready', function() {
    update.checkUpdate(updateWindow);
  });

  // mainWindow.maximize();
  Menu.setApplicationMenu(null);


  const dockMenu = Menu.buildFromTemplate([
    { label: '退出', click() { app.exit(0); } },
    { label: '切换用户', click() { app.quit(0); } },
  ])

  if (isMacOS) {
    app.dock.setMenu(dockMenu)
  }


  if (process.env.NODE_ENV.indexOf('development') !== -1) {
    BrowserWindow.addDevToolsExtension(path.join(__dirname, '../node_modules/devtron'));
    BrowserWindow.addDevToolsExtension(path.join(__dirname, '../node_modules/vue-devtools'));

    mainWindow.webContents.openDevTools();
    // updateWindow.webContents.openDevTools();
  }



  if (process.argv[1] === 'debug') {
    process.env.DEBUG = true;
  }






  mainWindow.on('close', function(e) {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    if (willQuitApp) {
      /* the user tried to quit the app */
      mainWindow = null;
    }
    if (mainWindow) {
      e.preventDefault();
    }

    hideWindow();

  })

  mainWindow.on('closed', function() {
    mainWindow = null;
  });

  mainWindow.on('minimize', function() {
    console.log('abc');
    setTimeout(()=>{mainWindow.webContents.executeJavaScript('window.messenger.onAppVisible()')},1000);
    
  });



  createTray();

  mainWindow.focus();
}

function showWindow() {
  if (mainWindow) {
    mainWindow.show();
    mainWindow.setSkipTaskbar(false);
  }
}

function hideWindow() {
  if (mainWindow) {
    mainWindow.hide();
    mainWindow.setSkipTaskbar(true);
  }
}

app.on('open-file', (e, path) => {
  // dialog.showErrorBox('openFile', path);
});

app.once('ready', createWindow);

app.on('window-all-closed', function() {
  app.quit();
});

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow();
  } else {
    showWindow();
  }
});

app.on('before-quit', () => willQuitApp = true);

// focus blur 适配hidden 和visible事件
app.on('browser-window-blur', (event, window) => {
  if (window == mainWindow) {
    window.webContents.executeJavaScript('window.messenger.onAppVisible()');
  }
})

app.on('browser-window-focus', (event, window) => {
  //if(!isMacOS)
  if (window == mainWindow) {
    window.webContents.executeJavaScript('window.messenger.onAppVisible()');
  }
})


// 小标逻辑
function createTray() {
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出',
      click() {
        mainWindow = null;
        app.quit();
      }
    }
  ])
  tray.setToolTip('FlyChat');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    mainWindow.isVisible() ? hideWindow() : showWindow()
  })

  var count = 0;
  setInterval(function() {
    count = (count + 1) % 2;
    if (count == 1) {
      tray.setImage(iconPath);
    } else {
      if (blinkTrayFlag) {
        tray.setImage(blinkIconPath);
      }

    }
  }, 500);
}

function blinkTray() {
  blinkTrayFlag = true;
}

function stopBlinkTray() {
  blinkTrayFlag = false;
}

ipcMain.on('new-messages-show', function(event, arg) {
  if (isMacOS) {
    app.dock.bounce();
    app.dock.setBadge('.');
  }

});
// ipc 交互逻辑
ipcMain.on('tray-badge', function(event, arg) {
  blinkTray();
  if (isMacOS) {
    app.dock.bounce();
    app.dock.setBadge(arg.count.toString());
  }

});

ipcMain.on('new-messages-hide', function(event, arg) {
  stopBlinkTray();
  if (isMacOS) {
    app.dock.setBadge('');
  }

});

ipcMain.on('tray-bounce', function(event, arg) {
  if (isMacOS) {
    app.dock.bounce();
  }

});

ipcMain.on('new-messages-notification', function(event, arg) {
  if (!mainWindow.isFocused()) {
    // notificationManager.addShowTime(5);
    // let notifications = JSON.parse(arg.notifications);
    blinkTray();
    if (isMacOS) {
      app.dock.bounce();
      app.dock.setBadge(arg.notifications.length.toString());
    }
    notification.LoadFromNotifications(arg.notifications);

    // console.log(arg);

  }

  if (isMacOS) {

  }

});

ipcMain.on('page-created', function(event, confirm) {

});

ipcMain.on('confirm-update', function(event, confirm) {

  if (confirm) {
    update.startUpdate(updateWindow);

  } else {
    updateWindow.hide();
  }

});

ipcMain.on('messageChange', function(event, arg) {
  console.log(Base64.encode(arg));
    // console.log("message:", arg.message[arg.message.length - 1].content.text, arg.message[arg.message.length - 1].sender.userName);
  });

ipcMain.on('quitAndInstall', function(event, confirm) {

  update.quitAndInstall();

});