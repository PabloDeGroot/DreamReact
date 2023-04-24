const { app, BrowserWindow } = require('electron');
const path = require('path');

const MAIN_HTML = path.join('file://', __dirname, 'main.html');
const CHILD_PADDING = 50;

const onAppReady = function () {
  //set width and height to match screen size
  
  let { width, height } = require('electron').screen.getPrimaryDisplay().size;
  let parent = new BrowserWindow({
    width: width,
    height: height,
    
    
    transparent: true,
    frame: false,
    //skipTaskbar: true,
  });
  parent.setAlwaysOnTop(true);
  parent.setIgnoreMouseEvents(true);
  parent.setResizable(false);
  parent.setFullScreen(true);
  parent.setFullScreenable(false);
  parent.setKiosk(true);
  parent.setMenu(null);
  parent.setMovable(false);
  parent.setSkipTaskbar(true);
  parent.setVisibleOnAllWorkspaces(true);
  parent.setVibrancy('dark');
  parent.setHasShadow(false);
  parent.setFocusable(false);

  parent.loadURL(`file://${__dirname}/main.html`)
  parent.show();

  parent.once('close', () => {
    parent = null;
  });


  //parent.loadURL(MAIN_HTML);
  parent.loadFile('main.html');
};

//~ app.on('ready', onAppReady);
app.on('ready', () => setTimeout(onAppReady, 500));
