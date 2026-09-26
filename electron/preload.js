import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Platform info
  platform: process.platform,
  
  // App info
  getAppVersion: () => process.env.npm_package_version,
  
  // Window controls
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  
  // File system operations (if needed)
  openFile: () => ipcRenderer.invoke('dialog-openFile'),
  saveFile: () => ipcRenderer.invoke('dialog-saveFile'),
  
  // App lifecycle
  onQuit: (callback) => ipcRenderer.on('app-quit', callback),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
  
  // Get clipboard
  getClipboard: () => ipcRenderer.invoke('clipboard-read'),
  setClipboard: (text) => ipcRenderer.invoke('clipboard-write', text),
});

// Expose version info
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

console.log('[Preload] Electron bridge exposed to renderer');