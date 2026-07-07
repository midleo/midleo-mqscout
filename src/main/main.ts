import { app, BrowserWindow, ipcMain, nativeImage, shell } from 'electron';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { homedir } from 'node:os';
import { join, sep } from 'node:path';
import { promisify } from 'node:util';
import { IPC_CHANNELS } from '../shared/ipc-channels';
import { registerIpcHandlers } from './ipc-handlers';

const execFileAsync = promisify(execFile);
const APP_HOME = join(homedir(), '.midleo');
const QM_LIST_PATH = join(APP_HOME, 'qmgrlist.json');
const JAR_PATH = join(APP_HOME, 'midleo.jar');

let mainWindow: BrowserWindow | null = null;

async function ensureAppHome(): Promise<void> {
  await fs.mkdir(APP_HOME, { recursive: true });
  try {
    await fs.access(QM_LIST_PATH);
  } catch {
    await fs.writeFile(QM_LIST_PATH, '[]', 'utf8');
  }
}

function resolveAppIcon(): Electron.NativeImage | undefined {
  const candidates = [
    join(app.getAppPath(), 'build', 'icon.png'),
    join(app.getAppPath(), 'dist', 'renderer', 'browser', 'assets', 'midleo-icon.png'),
  ];

  for (const iconPath of candidates) {
    const image = nativeImage.createFromPath(iconPath);
    if (!image.isEmpty()) {
      return image;
    }
  }

  return undefined;
}

function applyAppIcon(): void {
  const icon = resolveAppIcon();
  if (!icon) {
    return;
  }

  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(icon);
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#ffffff',
    title: 'Midleo MQScout',
    frame: false,
    center: true,
    show: false,
    icon: resolveAppIcon(),
    webPreferences: {
      preload: join(app.getAppPath(), 'dist', 'preload', 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
    },
  });

  mainWindow.once('ready-to-show', () => mainWindow?.show());
  mainWindow.loadFile(join(app.getAppPath(), 'dist', 'renderer', 'browser', 'index.html'));
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  applyAppIcon();
  await ensureAppHome();
  registerIpcHandlers({
    appHome: APP_HOME,
    qmListPath: QM_LIST_PATH,
    jarPath: JAR_PATH,
    execFileAsync,
  });
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://midleo.com') || url.startsWith('https://app.midleo.com')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
});

export { mainWindow };
