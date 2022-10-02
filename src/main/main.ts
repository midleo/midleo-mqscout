import { app, BrowserWindow, ipcMain, Menu  } from 'electron';
import * as path from 'path';
const fs = require('fs');
const exec = require('child_process').exec;
const _HOME_ = require('os').homedir();
const _SEP_ = require('path').sep;
const _APPHOME_ = `${_HOME_}${_SEP_}.midleo${_SEP_}`;

if (!fs.existsSync(_APPHOME_)) fs.mkdirSync(_APPHOME_);
if (!fs.existsSync(_APPHOME_ + 'qmgrlist.json')) fs.writeFileSync(_APPHOME_ + 'qmgrlist.json',"[{}]");

let win: BrowserWindow;

app.on('ready', createWindow);

app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#fcf9f9',
    fullscreen: true,
    icon: path.join(__dirname, 'assets/midleo-logo-white.png') ,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
      preload: path.join(app.getAppPath(), 'dist/preload', 'preload.js'),
      sandbox: true
    }
  });

  // Menu.setApplicationMenu(null);

  win.loadFile(path.join(app.getAppPath(), 'dist/renderer', 'index.html'));

  win.on('closed', () => {
    win = null;
  });
}

ipcMain.on('updateQM', (event, arg) => {
  fs.writeFileSync(_APPHOME_ + 'qmgrlist.json', arg);
  event.returnValue = 'Qmanagers updated successfully';
});

ipcMain.on('readQMList', () => {
  const rawdata = fs.readFileSync(_APPHOME_ + 'qmgrlist.json');
  if (win) {
    win.webContents.send('readQMListData', rawdata);
  }
});

ipcMain.on('execPCFQD', (event, arg) => {
  const childPorcess = exec('java -jar ' + path.join(app.getAppPath(), 'dist/renderer/assets', 'midleoapp.jar') + ' ' + arg, (err, stdout, stderr) => {
    if (err) {
      event.returnValue = stderr;
    }
    event.returnValue = stdout;
  });
});
