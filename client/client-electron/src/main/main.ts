/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, screen } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { spawn } from 'child_process';





//import ffmpeg from 'ffmpeg-static';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

console.log("test")

var koffi = require("koffi");
const lib = koffi.load('user32.dll');

var HWND_BROADCAST = 0xffff;
const WM_RBUTTONDOWN = 0x0204;
const WM_RBUTTONUP = 0x0205;
const WM_LBUTTONDOWN = 0x0201;
const WM_LBUTTONUP = 0x0202;
//activate window
const WM_ACTIVATE = 0x0006;


//move mouse
const WM_MOUSEMOVE = 0x0200;




// Find functions
const SendMessageA = lib.stdcall('SendMessageA', 'int', ['int', 'uint', 'int', 'int']);
//Get foucs window
const GetForegroundWindow = lib.stdcall('GetForegroundWindow', 'int', []);

HWND_BROADCAST = GetForegroundWindow();



let ret =  SendMessageA(HWND_BROADCAST, WM_LBUTTONDOWN, 444, 444);
let ret2 =  SendMessageA(HWND_BROADCAST, WM_LBUTTONUP, 444, 444);
//activate window
let ret3 =  SendMessageA(HWND_BROADCAST, WM_ACTIVATE, 444, 444);



console.log(ret);

//let ret2 =  SendMessageA(HWND_BROADCAST, WM_LBUTTONUP, 10, 10);



let mainWindow: BrowserWindow | null = null;

const { desktopCapturer } = require('electron')



ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});
ipcMain.on('getMousePosition', async (event, arg) => {
  const mousePosition = screen.getCursorScreenPoint();
  event.reply('getMousePosition', mousePosition);
});



if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug && false) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };
  let { width, height } = require('electron').screen.getPrimaryDisplay().size;

  mainWindow = new BrowserWindow({
    show: false,
    width: width,
    height: height,
    transparent: true,
    frame: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {

      nodeIntegration: true,


      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));
  /*mainWindow.setAlwaysOnTop(true);
   mainWindow.setIgnoreMouseEvents(true);
   mainWindow.setResizable(false);
   mainWindow.setFullScreen(true);
   mainWindow.setFullScreenable(false);
   mainWindow.setKiosk(true);
   mainWindow.setMenu(null);
   mainWindow.setMovable(false);
   mainWindow.setSkipTaskbar(true);
 */
  mainWindow.setFocusable(false);
  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }

    desktopCapturer.getSources({ types: ['screen'] }).then(async sources => {

      for (const source of sources) {
        console.log(source)

        if (source.id.split(":")[0] == "screen") {

          mainWindow?.webContents.send('SET_SOURCE', source)

          return
        }
      }
    })


  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();


    //mainWindow?.webContents.send('sendStream', stream);
    //setInterval(() => {
    //  const mousePosition = screen.getCursorScreenPoint();
    //  console.log("sending");
    //  mainWindow?.webContents.send('getMousePosition', mousePosition);
    //}, 10);

    console.log("activate")








    app.on('activate', () => {



      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();


    });
  })
  .catch(console.log);
