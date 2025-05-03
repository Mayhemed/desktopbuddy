import activeWin from 'active-win';
import { EventEmitter } from 'events';
import { WindowInfo } from '../types';

export class WindowMonitorService extends EventEmitter {
  private windows: Map<string, WindowInfo> = new Map();
  private pollingInterval: NodeJS.Timeout | null = null;
  private pollingFrequency: number = 5000; // 5 seconds default
  
  constructor(pollingFrequency?: number) {
    super();
    if (pollingFrequency) {
      this.pollingFrequency = pollingFrequency;
    }
  }
  
  public start(): void {
    if (this.pollingInterval) {
      return;
    }
    
    // Initial capture
    this.captureActiveWindow();
    
    // Start polling
    this.pollingInterval = setInterval(() => {
      this.captureActiveWindow();
    }, this.pollingFrequency);
  }
  
  public stop(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
  
  public getWindows(): WindowInfo[] {
    return Array.from(this.windows.values());
  }
  
  private async captureActiveWindow(): Promise<void> {
    try {
      const activeWindow = await activeWin();
      
      if (!activeWindow) {
        return;
      }
      
      const now = Date.now();
      const windowId = `${activeWindow.owner.processId}-${activeWindow.id}`;
      
      // Check if this window is already being tracked
      const existingWindow = this.windows.get(windowId);
      
      if (existingWindow) {
        // Update the existing window info
        existingWindow.title = activeWindow.title;
        existingWindow.lastActiveTime = now;
        existingWindow.isActive = true;
        
        // Update any other windows to be inactive
        this.windows.forEach((window, id) => {
          if (id !== windowId) {
            window.isActive = false;
          }
        });
        
        this.emit('windowUpdated', existingWindow);
      } else {
        // Create a new window entry
        const newWindow: WindowInfo = {
          id: windowId,
          title: activeWindow.title,
          application: activeWindow.owner.name,
          path: activeWindow.owner.path,
          url: activeWindow.url,
          bounds: activeWindow.bounds,
          isActive: true,
          startTime: now,
          lastActiveTime: now
        };
        
        this.windows.set(windowId, newWindow);
        
        // Update any other windows to be inactive
        this.windows.forEach((window, id) => {
          if (id !== windowId) {
            window.isActive = false;
          }
        });
        
        this.emit('windowAdded', newWindow);
      }
      
      this.emit('windowsUpdated', this.getWindows());
      
    } catch (error) {
      console.error('Error capturing active window:', error);
      this.emit('error', error);
    }
  }
  
  // Helper method to calculate duration in minutes
  public getWindowDuration(windowId: string): number {
    const window = this.windows.get(windowId);
    
    if (!window) {
      return 0;
    }
    
    return Math.round((Date.now() - window.startTime) / 60000); // Convert to minutes
  }
  
  // Get total time spent on an application
  public getApplicationDuration(applicationName: string): number {
    let totalDuration = 0;
    
    this.windows.forEach(window => {
      if (window.application === applicationName) {
        totalDuration += this.getWindowDuration(window.id);
      }
    });
    
    return totalDuration;
  }
}
