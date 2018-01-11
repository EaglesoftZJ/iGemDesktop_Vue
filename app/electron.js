const electron = require('electron');
const path = require('path');

const { app, Menu, MenuItem, Tray, ipcMain, BrowserWindow, dialog, clipboard, nativeImage } = require('electron');
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
let clearChatWhenBlured = true;

const elctronConfig = new ElctronConfig();

if (!elctronConfig.get('notification')) {
  elctronConfig.set('notification.show', true);
}

let screenWidth;
let screenHeight;


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
    height: 700,
    fullscreenable: false
  });

  screenWidth = electron.screen.getPrimaryDisplay().workAreaSize.width;
  screenHeight = electron.screen.getPrimaryDisplay().workAreaSize.height;

  let width = 320;
  let height = 130;

  let offsetX = 340;

  let offSetY = height + 10;

  if (isMacOS) {
    offsetX = -2000;
    offSetY = -2000;
  }

  // console.log(isMacOS, offsetX);

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
    show: false,
    resizable: false,
    movable: false,
    useContentSize: true
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


  var readSize = 0;

  notificationWindow.webContents.on('dom-ready', function() {
    notification.init(notificationWindow);
    readSize++;
    if (readSize === 2) {
      update.checkUpdate(updateWindow, notification);
    }
  });

  updateWindow.webContents.on('dom-ready', function() {
    readSize++;
    if (readSize === 2) {
      update.checkUpdate(updateWindow, notification);
    }
  });

  // mainWindow.maximize();
  Menu.setApplicationMenu(null);

  // 配置右键菜单
  const menu = new Menu();
  menu.append(new MenuItem({
    label: '复制',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }));
  menu.append(new MenuItem({
    label: '粘贴',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }));

  menu.append(new MenuItem({
    label: '剪切',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }));
  
  menu.append(new MenuItem({
    label: '全选',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectall'
  }));

  mainWindow.webContents.on('context-menu', function (e, params) {
    menu.popup(mainWindow, params.x, params.y)
  });






  if (process.env.NODE_ENV.indexOf('development') !== -1) {
    BrowserWindow.addDevToolsExtension(path.join(__dirname, '../node_modules/devtron'));
    BrowserWindow.addDevToolsExtension(path.join(__dirname, '../node_modules/vue-devtools'));

    mainWindow.webContents.openDevTools();
    notificationWindow.webContents.openDevTools();
    // updateWindow.webContents.openDevTools();
  }
  // mainWindow.webContents.openDevTools();


  if (process.argv[1] === 'debug') {
    process.env.DEBUG = true;
  }


  // 拦截主页面下载
  mainWindow.webContents.session.on('will-download', function(e, item) {
    console.log('will-download');
    var arr = item.getFilename().match(/\.(\w*)$/);
    var extension = arr ? arr[1] : '*';
    var savePath = dialog.showSaveDialog(mainWindow, 
      { defaultPath: item.getFilename(), 
        filters: [{ name: 'All Files', extensions: [extension]}] 
      });
    if (savePath != undefined) {
      item.setSavePath(savePath)
    } else {
      item.cancel()
      mainWindow.webContents.send('downloadCancelled');
      return
    }
    item.on('updated', function() {
      // console.log('Received bytes: ' + item.getReceivedBytes());
    });
    item.on('done', function(e, state) {
      if (state == "completed") {
        mainWindow.webContents.send('downloadCompleted');
        console.log("Download successfully");
      } else {
        mainWindow.webContents.send('downloadCancelled');
        console.log("Download is cancelled or interrupted that can't be resumed");
      }
    })
  })






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
    // console.log('abc');
    setTimeout(() => { mainWindow.webContents.executeJavaScript('window.messenger.onAppVisible()') }, 1000);

  });

  if (isMacOS) {
    var template = [{
      label: "程序",
      submenu: [
        { label: "关于", selector: "orderFrontStandardAboutPanel:" },
        { type: "separator" },
        { label: "退出", accelerator: "Command+Q", click: function() { notification.stop(); app.exit(0); } }
      ]
    }, {
      label: "编辑",
      submenu: [
        { label: "撤销", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "恢复", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "剪切", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "复制", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "粘贴", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "全选", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
      ]
    }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));


  }




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
    // if (currentUID && clearChatWhenBlured) {
    //   window.webContents.send('windows-blur', currentUID);
    // }
  }
})

app.on('browser-window-focus', (event, window) => {
  //if(!isMacOS)
  if (window == mainWindow) {
    stopBlinkTray();
    window.webContents.executeJavaScript('window.messenger.onAppVisible()');
    if (currentUID) {
      window.webContents.send('windows-focus', currentUID);
    }
    // if(!clearChatWhenBlured) {
    //   clearChatWhenBlured = true;
    // }

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

      }
    },
    {
      label: '注销',
      click() {
        mainWindow.webContents.send('setLoggedOut');
        mainWindow.webContents.executeJavaScript('localStorage.clear();location.reload();');
      }
    },
    // {
    //   label: '重新加载数据',
    //   click() {
    //     let js = 'location.href=="'+ config.url + '"?location.reload():location.href="' + config.url + '"';
    //     console.log(js);
    //     mainWindow.webContents.executeJavaScript(js);
    //   }
    // },
    {
      label: '退出',
      click() {
        notification.stop();
        app.exit(0);
      }
    },

  ]);
  if (isMacOS) {
    app.dock.setMenu(contextMenu)
    tray.on('click', () => {
      showWindow();
    })
  } else {
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      mainWindow.isVisible() ? hideWindow() : showWindow()
    })
  }


  tray.setToolTip('FlyChat');


  

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
  // console.log(123, blinkTrayFlag);
}

function stopBlinkTray() {
  blinkTrayFlag = false;
  // console.log(321, blinkTrayFlag);
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
  // stopBlinkTray();
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
  // console.log(123, arg);
  if (!mainWindow.isFocused()) {
    // notificationManager.addShowTime(5);
    // let notifications = JSON.parse(arg.notifications);


    // blinkTray();
    // if (isMacOS) {
    //   app.dock.bounce();
    //   app.dock.setBadge(arg.notifications.length.toString());
    // }
    // notification.LoadFromNotifications(arg.notifications);

    // console.log(arg);

  }

  if (isMacOS) {

  }

});

ipcMain.on('new-messages', function(event, arg) {
  if (!mainWindow.isFocused()) {
    // notificationManager.addShowTime(5);
    // let notifications = JSON.parse(arg.notifications);

    var len = arg.minimizeMsg && arg.minimizeMsg.length;
    if (len) {
      blinkTray();
      if (isMacOS) {
        app.dock.bounce();
        app.dock.setBadge(arg.minimizeMsg.length.toString());
      }
      // 数据更新消息框展示
      notification.LoadFromNotifications(arg.minimizeMsg, 'show');
    }
      
    // blinkTray();
    // var len = null;
    // if (arg.minimizeMsg)
    //   len = arg.minimizeMsg.length.toString();
    // if (isMacOS && len) {
    //   app.dock.bounce();
    //   app.dock.setBadge(len);
    // }
    // // 数据更新消息框展示
    // notification.LoadFromNotifications(arg.minimizeMsg, 'show');

    // console.log(arg);

  } else {
    // 数据更新消息框不展示
    notification.LoadFromNotifications(arg.minimizeMsg, 'update');    
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
  // console.log(123, 'confirm-update');
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
  // console.log('size-change');
  //console.log(notificationWindow.getPosition());
  var preHeight = notificationWindow.getSize()[1];
  var x = notificationWindow.getPosition()[0];
  var y = notificationWindow.getPosition()[1];
  notificationWindow.setSize(arg.width, arg.height);
  

  
  notificationWindow.setPosition(x, screenHeight - arg.height);
  

  // console.log("size",screenWidth,screenHeight, notificationWindow.getPosition()[0],notificationWindow.getPosition()[1]);
  
});

ipcMain.on('active-focus', function(event, arg) {
  showWindow();
});

ipcMain.on('dialog-switch', function(event, arg) {
  // console.log(1111111111, arg);
  var info = arg.dialogInfo;
  if(info) {
    var currentDialog = (info.members ? 'g' : 'u') + info.id;
    currentUID = currentDialog;
    var currentType = info.members ? 'group' : 'user';
    var currentAvatar = info.avatar;
    var currentPlaceholder = info.placeholder;
    var currentName = info.name;
    notificationWindow.webContents.send('update-current-dailog', {currentDialog, currentType, currentAvatar, currentPlaceholder, currentName});

  }
 
});

ipcMain.on('notification-click', function(event, arg) {
  // console.log('arg',arg);
  if(arg.startsWith("u")||arg.startsWith("g")) {
    currentUID = arg;
  } else {
    currentUID = 'u' + arg;
  }
  
  notification.clearShowTime();
  mainWindow.show();
})

// 存储当前窗口最后一条信息key
var currentMsgKey = '';

ipcMain.on('message-change', function(event, arg) {
  // console.log('message-change');
  var currentMsg = null;
  if (arg.currentMsg)
   currentMsg = arg.currentMsg[arg.currentMsg.length - 1];

  if (!mainWindow.isFocused() && currentMsg && currentMsgKey !== currentMsg['sortKey']) {
    // console.log(123, 'blinkTray');
    blinkTray();
    notification.loadCurrentMessage({
      text: currentMsg.content.text, 
      title: currentMsg.sender.title, 
      id: currentMsg.sender.peer.key, 
      content: currentMsg.content.content,
      fileUrl: currentMsg.content.preview,
      fileName: currentMsg.content.fileName
    });
  } 
  currentMsgKey = currentMsg ? currentMsg['sortKey'] : '';
  // console.log("message:", arg.message[arg.message.length - 1].content.text, arg.message[arg.message.length - 1].sender.userName);
});

ipcMain.on('quitAndInstall', function(event, confirm) {

  update.quitAndInstall();

});

ipcMain.on('logged-in', function(event, arg) {
  mainWindow.webContents.send('loginStore', elctronConfig.get('login'))
  console.log('logged-in', elctronConfig.get('login'));
});

ipcMain.on('setLoginStore', function(event, arg) {
  elctronConfig.set('login.' + arg.key, arg.value);
  console.log('setLoginStore', elctronConfig.get('login'));
});

ipcMain.on('getDialogStore', function(event, arg) {
  mainWindow.webContents.send('dialogStore', elctronConfig.get('dialog'));
})

ipcMain.on('setDialogStore', function(event, arg) {
  elctronConfig.set('dialog.' + arg.key, arg.value);
})


ipcMain.on('getCurrentUID', function(event, arg) {
  elctronConfig.set('login.' + arg.key, arg.value);
  // console.log(elctronConfig.get('login'));
});

ipcMain.on('startUploadFile', function(event, arg) {
  clearChatWhenBlured = false;
  // mainWindow.webContents.send("openFileSelector")
});

ipcMain.on('endUploadFile', function(event, arg) {
  clearChatWhenBlured = true;
});

// 图片复制
ipcMain.on('copy-image', function(event, arg) {
  var dataUrl = arg.dataUrl;
  var img = nativeImage.createFromDataURL(dataUrl);
  clipboard.writeImage(img);
});


var inLoginTimes = 0;
var inMainTimes = 0;

// 记录主窗口进入main次数
ipcMain.on('recodeInMain', function(event, arg) {
  inMainTimes++;
  console.log('inMainTimes', inMainTimes, inLoginTimes);
  mainWindow.webContents.send('inMainTimes', {main: inMainTimes, login: inLoginTimes});
});

// 记录主窗口进入login次数
ipcMain.on('recodeInLogin', function(event, arg) {
   inLoginTimes++;
   console.log('inLoginTimes', inMainTimes, inLoginTimes);
});