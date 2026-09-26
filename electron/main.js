import { app, BrowserWindow, shell, Menu, Tray, nativeImage } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';

// ES Module __dirname equivalent - works in both dev and production
const getBasePath = () => {
  if (is.dev) {
    return dirname(fileURLToPath(import.meta.url));
  }
  // In production, use app.getAppPath()
  return app.getAppPath();
};

// Global references to prevent garbage collection
let mainWindow = null;
let tray = null;

function createWindow() {
  const basePath = getBasePath();
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: false,
    title: 'Business Plus',
    webPreferences: {
      preload: join(basePath, 'preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    console.log('[Electron] Window ready to show, basePath:', basePath);
  });

  // Handle external links to open in default browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Load the app
  if (is.dev && process.env['VITE_DEV_SERVER_URL']) {
    mainWindow.loadURL(process.env['VITE_DEV_SERVER_URL']);
  } else {
    // In production, dist is in the same asar, use relative path
    mainWindow.loadFile(join(basePath, 'dist/index.html'));
  }

  // Open DevTools in development
  if (is.dev) {
    mainWindow.webContents.openDevTools();
  }

  console.log('[Electron] Window created successfully');
}

function createTray() {
  // Create a simple tray icon (16x16 transparent)
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setToolTip('Business Plus');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}

function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow?.webContents.reload();
          },
        },
        {
          label: 'Toggle DevTools',
          accelerator: 'F12',
          click: () => {
            mainWindow?.webContents.toggleDevTools();
          },
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Zoom In',
          accelerator: 'CmdOrCtrl+Plus',
          click: () => {
            const webContents = mainWindow?.webContents;
            if (webContents) {
              const currentZoom = webContents.getZoomLevel();
              webContents.setZoomLevel(currentZoom + 0.5);
            }
          },
        },
        {
          label: 'Zoom Out',
          accelerator: 'CmdOrCtrl+-',
          click: () => {
            const webContents = mainWindow?.webContents;
            if (webContents) {
              const currentZoom = webContents.getZoomLevel();
              webContents.setZoomLevel(currentZoom - 0.5);
            }
          },
        },
        {
          label: 'Reset Zoom',
          accelerator: 'CmdOrCtrl+0',
          click: () => {
            mainWindow?.webContents.setZoomLevel(0);
          },
        },
        { type: 'separator' },
        {
          label: 'Toggle Full Screen',
          accelerator: 'F11',
          click: () => {
            mainWindow?.setFullScreen(!mainWindow?.isFullScreen());
          },
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          click: () => {
            mainWindow?.minimize();
          },
        },
        {
          label: 'Maximize',
          click: () => {
            if (mainWindow?.isMaximized()) {
              mainWindow.unmaximize();
            } else {
              mainWindow?.maximize();
            }
          },
        },
        { type: 'separator' },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          click: () => {
            mainWindow?.close();
          },
        },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Business Plus',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About Business Plus',
              message: 'Business Plus',
              detail: 'Version 1.0.0\n\nA comprehensive business management application.',
            });
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App lifecycle
app.whenReady().then(() => {
  console.log('[Electron] App ready, initializing...');

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.businessplus.app');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrCtrl + R in production.
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createMenu();
  createWindow();
  // createTray(); // Uncomment to enable system tray

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  console.log('[Electron] App quitting...');
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('[Electron] Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Electron] Unhandled Rejection at:', promise, 'reason:', reason);
});