const electron = require('electron');
const path = require('path');

const { app, Menu, Tray, ipcMain, BrowserWindow, dialog} = require('electron');




let mainWindow;

let blinkTrayFlag = false;
let isMacOS = (process.platform === 'darwin');

let trayPath = 'tray';
if (isMacOS) {
  trayPath = 'mac_' + trayPath;
}
const iconPath = path.join(__dirname, './icons/' + trayPath + '.png');
const blinkIconPath = path.join(__dirname, './icons/' + trayPath + '_blink.png');

let config = {};

if (!!process.env.NODE_ENV) {
  // null
}
else {
  process.env.NODE_ENV = 'production';
}

if (process.env.NODE_ENV === 'developmentHot') {
  config = require('../config');
  config.url = `http://localhost:3000`;
}
else {
  config.devtron = false;
  config.url = `http://61.175.100.14:5433/`;
}

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

  // mainWindow.maximize();
  Menu.setApplicationMenu(null);

  if (process.env.NODE_ENV.indexOf('development') !== -1) {
    BrowserWindow.addDevToolsExtension(path.join(__dirname, '../node_modules/devtron'));
    BrowserWindow.addDevToolsExtension(path.join(__dirname, '../node_modules/vue-devtools'));

    mainWindow.webContents.openDevTools();
  }

  if (process.env.NODE_ENV === 'production') {
    const UpdateObj = require('./update');
    let update = new UpdateObj();
    update.setFeedURL('http://localhost');
    update.checkLocalUpdates();
    if (process.argv[1] === 'debug') {
      process.env.DEBUG = true;
    }
  }

  

  mainWindow.loadURL(config.url);

  mainWindow.on('close', function(e) {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    if (mainWindow) {
      e.preventDefault();
    }

    hideWindow();

  })

  mainWindow.on('closed', function() {
    mainWindow = null;
  });


  createTray();

  mainWindow.focus();
  console.log('mainWindow opened');
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

// focus blur 适配hidden 和visible事件
app.on('browser-window-blur', (event, window) => {
  if (window == BrowserWindow) {
    window.webContents.executeJavaScript('window.messenger.onAppHidden()');
  }
})

app.on('browser-window-focus', (event, window) => {
  //if(!isMacOS)
  if (window == BrowserWindow) {
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
  tray.setToolTip('iGem');
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

  }
  if (isMacOS) {
    
  }

});
