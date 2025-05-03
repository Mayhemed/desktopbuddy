import { contextBridge, ipcRenderer } from 'electron';
import { WindowInfo, ProductivityInsight, SessionData, Settings } from './types';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('desktopBuddy', {
  getWindows: (): Promise<WindowInfo[]> => ipcRenderer.invoke('get-windows'),
  getInsights: (): Promise<ProductivityInsight[]> => ipcRenderer.invoke('get-insights'),
  getSessionHistory: (): Promise<SessionData[]> => ipcRenderer.invoke('get-session-history'),
  updateSettings: (settings: Partial<Settings>): Promise<boolean> => ipcRenderer.invoke('update-settings', settings),
  
  onWindowsUpdated: (callback: (windows: WindowInfo[]) => void) => {
    const subscription = (_: any, windows: WindowInfo[]) => callback(windows);
    ipcRenderer.on('windows-updated', subscription);
    
    return () => {
      ipcRenderer.removeListener('windows-updated', subscription);
    };
  },
  
  onInsightsUpdated: (callback: (insights: ProductivityInsight[]) => void) => {
    const subscription = (_: any, insights: ProductivityInsight[]) => callback(insights);
    ipcRenderer.on('insights-updated', subscription);
    
    return () => {
      ipcRenderer.removeListener('insights-updated', subscription);
    };
  },
  
  onInitialData: (callback: (data: { 
    sessionHistory: SessionData[], 
    insights: ProductivityInsight[], 
    settings: Settings 
  }) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('initial-data', subscription);
    
    return () => {
      ipcRenderer.removeListener('initial-data', subscription);
    };
  }
});
