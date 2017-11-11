const electron = require('electron');
const path = require('path');

const { app, Menu, Tray, ipcMain, BrowserWindow, dialog } = require('electron');
const ElctronConfig = require('electron-config');


let mainWindow;
let updateWindow;
let notificationWindow;

let blinkTrayFlag = false;
let isMacOS = (process.platform === 'darwin');

let localUrl;
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

let currentUID;

const elctronConfig = new ElctronConfig();

if (!elctronConfig.get('notification')) {
  elctronConfig.set('notification.show',true);
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
  localUrl = `http://localhost:${config.port}/`;
}
else {
  config.devtron = false;

  localUrl = 'file://' + path.join(__dirname, './dist/index.html');
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

  let width = 320;
  let height = 130;
 
  let offsetX = 340;

  let offSetY = height + 10;

  if (isMacOS) {
    offsetX = -2000;
    offSetY = -2000;
  }

  console.log(isMacOS, offsetX);

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

  width = 260;
  height = 0;

  notificationWindow = new BrowserWindow({
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
  notificationWindow.hide();


  updateWindow.loadURL(localUrl);
  notificationWindow.loadURL(localUrl);

  mainWindow.loadURL(config.url);

  const UpdateObj = require('./update');

  const NotificationObj = require('./notificationManager');
  update = new UpdateObj();
  notification = new NotificationObj();

  notification.allowShow = elctronConfig.get("notification.show");
  update.setFeedURL('http://61.175.100.14:8012/ActorServices-Maven/services/ActorService?wsdl');
  // update.setFeedURL('http://192.168.1.182:8080/services/ActorService?wsdl');



  updateWindow.webContents.on('dom-ready', function() {
    update.checkUpdate(updateWindow);
  });

  notificationWindow.webContents.on('dom-ready', function() {
    notification.init(notificationWindow);
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
    // notificationWindow.webContents.openDevTools();
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
      mainWindow.webContents.executeJavaScript('localStorage.clear()');
      elctronConfig.set('login.info.isLogin', false);
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
    setTimeout(() => { mainWindow.webContents.executeJavaScript('window.messenger.onAppVisible()') }, 1000);

  });



  createTray();

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

app.on('before-quit', () => {
  willQuitApp = true;
  notification.stop();
  notification = null;
  update = null;
  updateWindow = null;
  notificationWindow = null;
});

// focus blur 适配hidden 和visible事件
app.on('browser-window-blur', (event, window) => {
  if (window == mainWindow) {
    window.webContents.executeJavaScript('window.messenger.onAppVisible()');
    if (currentUID) {
      window.webContents.send('windows-blur', currentUID);
    }
  }
})

app.on('browser-window-focus', (event, window) => {
  //if(!isMacOS)
  if (window == mainWindow) {
    window.webContents.executeJavaScript('window.messenger.onAppVisible()');
    if (currentUID) {
      window.webContents.send('windows-focus', currentUID);
    }

  }
})


// 小标逻辑
function createTray() {
  tray = new Tray(iconPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '允许推送',
      type: 'checkbox',
      checked: elctronConfig.get('notification.show'),
      click() {
        
        let showNoti = elctronConfig.get('notification.show')

       
        elctronConfig.set('notification.show', !showNoti);
        notification.allowShow = !showNoti;

        console.log('showNoti',showNoti,notification.allowShow, elctronConfig.path);

      }
    },
    {
      label: '注销',
      click() {
        mainWindow.webContents.send('setLoggedOut');
        mainWindow.webContents.executeJavaScript('localStorage.clear();location.reload();');
      }
    },
    {
      label: '退出',
      click() {
        mainWindow = null;
        app.quit();
      }
    },
   
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

ipcMain.on('update-created', function(event, confirm) {
  if (confirm && notification) {
    notification.stop();
  }
});

ipcMain.on('confirm-update', function(event, confirm) {

  if (confirm) {
    update.startUpdate(updateWindow);

  } else {
    updateWindow.hide();
    if (notification) {
      notification.start();
    }
  }

});

// 消息框尺寸变化
ipcMain.on('size-change', function(event, arg) {
  console.log('size-change');
  // console.log(notificationWindow.getPosition());
  var preHeight = notificationWindow.getSize()[1];
  var x = notificationWindow.getPosition()[0];
  var y = notificationWindow.getPosition()[1];
  notificationWindow.setSize(arg.width, arg.height);
  notificationWindow.setPosition(x, y + preHeight - arg.height);
});

ipcMain.on('logged-in', function(event, arg) {
  mainWindow.focus();
});

ipcMain.on('dialog-switch', function(event, arg) {
  console.log('dialog-switch',arg);
  currentUID = arg;
  notificationWindow.webContents.send('update-current-messages', {});
});

ipcMain.on('notification-click', function(event, arg){
  currentUID = 'u' + arg;
  mainWindow.focus();
})

// ipcMain.on('message-change', function(event, arg) {
//   console.log('message-change');
//   if (!mainWindow.isFocused()) {
//     blinkTray();
//     notification.loadCurrentMessage(arg.message[arg.message.length - 1].content.text, arg.message[arg.message.length - 1].sender.userName);
    
//   }
//   // console.log("message:", arg.message[arg.message.length - 1].content.text, arg.message[arg.message.length - 1].sender.userName);
// });

ipcMain.on('quitAndInstall', function(event, confirm) {

  update.quitAndInstall();

});

ipcMain.on('logged-in', function(event, arg) {
  mainWindow.webContents.send('loginStore', elctronConfig.get('login'))
});

ipcMain.on('setLoginStore', function(event, arg) {
  elctronConfig.set('login.' + arg.key, arg.value);
  console.log(elctronConfig.get('login'));
});

