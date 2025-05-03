import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, powerMonitor } from 'electron';
import path from 'path';
import { WindowMonitorService } from './services/WindowMonitorService';
import { AnalysisService } from './services/AnalysisService';
import { StorageService } from './services/StorageService';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let windowMonitor: WindowMonitorService | null = null;
let analysisService: AnalysisService | null = null;
let storageService: StorageService | null = null;
let isQuitting = false;

// Initialize services
function initializeServices() {
  storageService = new StorageService();
  const settings = storageService.getSettings();
  
  windowMonitor = new WindowMonitorService(settings.pollingFrequency);
  analysisService = new AnalysisService();
  
  // Set app thresholds from settings
  Object.entries(settings.thresholds).forEach(([app, threshold]) => {
    analysisService.setThreshold(app, threshold);
  });
  
  // Start monitoring
  windowMonitor.start();
  
  // Set up event handlers
  windowMonitor.on('windowsUpdated', (windows) => {
    if (mainWindow) {
      mainWindow.webContents.send('windows-updated', windows);
    }
    
    analysisService.updateWindows(windows);
    
    // Generate insights
    const insights = analysisService.generateInsights();
    
    if (mainWindow) {
      mainWindow.webContents.send('insights-updated', insights);
    }
    
    // Save insights
    insights.forEach(insight => {
      storageService.saveInsight(insight);
    });
    
    // Calculate app breakdown
    const appBreakdown: Record<string, number> = {};
    windows.forEach(window => {
      const app = window.application;
      if (!appBreakdown[app]) {
        appBreakdown[app] = 0;
      }
      
      const duration = (Date.now() - window.startTime) / 60000; // Minutes
      appBreakdown[app] += duration;
    });
    
    // Calculate total active time
    const totalActiveTime = Object.values(appBreakdown).reduce((sum, duration) => sum + duration, 0);
    
    // Save session data
    storageService.saveSession(windows, totalActiveTime, appBreakdown);
  });
  
  windowMonitor.on('error', (error) => {
    console.error('Window monitor error:', error);
  });
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png')
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Prevent closing the window (minimize to tray instead)
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
      return false;
    }
  });
  
  // Send initial data to renderer
  if (storageService && mainWindow) {
    const sessionHistory = storageService.getSessionHistory();
    const insights = storageService.getInsights();
    const settings = storageService.getSettings();
    
    mainWindow.webContents.on('did-finish-load', () => {
      mainWindow.webContents.send('initial-data', {
        sessionHistory,
        insights,
        settings
      });
    });
  }
}

function createTray() {
  const icon = nativeImage.createFromPath(path.join(__dirname, 'assets', 'icon.png'));
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: 'Show DesktopBuddy',  
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Quit', 
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('DesktopBuddy');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
  });
}

// App lifecycle events
app.on('ready', () => {
  initializeServices();
  createWindow();
  createTray();
  
  // Handle system power events
  powerMonitor.on('resume', () => {
    console.log('System resumed from sleep');
    if (windowMonitor) {
      // Restart monitoring
      windowMonitor.stop();
      windowMonitor.start();
    }
  });
  
  powerMonitor.on('suspend', () => {
    console.log('System going to sleep');
    if (windowMonitor) {
      // Pause monitoring
      windowMonitor.stop();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  isQuitting = true;
  
  if (windowMonitor) {
    windowMonitor.stop();
  }
});

// IPC event handlers
ipcMain.handle('get-windows', () => {
  return windowMonitor ? windowMonitor.getWindows() : [];
});

ipcMain.handle('get-insights', () => {
  return analysisService ? analysisService.generateInsights() : [];
});

ipcMain.handle('get-session-history', () => {
  return storageService ? storageService.getSessionHistory() : [];
});

ipcMain.handle('update-settings', (_, settings) => {
  if (storageService) {
    storageService.updateSettings(settings);
    
    // Update services with new settings
    if (windowMonitor && settings.pollingFrequency) {
      windowMonitor.stop();
      windowMonitor = new WindowMonitorService(settings.pollingFrequency);
      windowMonitor.start();
    }
    
    if (analysisService && settings.thresholds) {
      Object.entries(settings.thresholds).forEach(([app, threshold]) => {
        analysisService.setThreshold(app, threshold);
      });
    }
    
    return true;
  }
  
  return false;
});
