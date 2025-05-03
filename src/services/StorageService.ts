import ElectronStore from 'electron-store';
import { WindowInfo, ProductivityInsight, SessionData, Settings } from '../types';

interface StorageSchema {
  sessionHistory: SessionData[];
  insights: ProductivityInsight[];
  settings: Settings;
}

export class StorageService {
  private store: ElectronStore<StorageSchema>;
  
  constructor() {
    this.store = new ElectronStore<StorageSchema>({
      defaults: {
        sessionHistory: [],
        insights: [],
        settings: {
          pollingFrequency: 5000,
          thresholds: {
            'Google Chrome': 45,
            'Microsoft Edge': 45,
            'Firefox': 45,
            'Slack': 30,
            'Discord': 20,
            'default': 60
          },
          notifications: true
        }
      }
    });
  }
  
  public saveSession(windows: WindowInfo[], totalActiveTime: number, appBreakdown: Record<string, number>): void {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const sessionHistory = this.store.get('sessionHistory');
    
    // Check if we already have an entry for today
    const todayIndex = sessionHistory.findIndex(session => session.date === today);
    
    if (todayIndex >= 0) {
      // Update existing session
      sessionHistory[todayIndex] = {
        date: today,
        windows,
        totalActiveTime,
        applicationBreakdown: appBreakdown
      };
    } else {
      // Add new session
      sessionHistory.push({
        date: today,
        windows,
        totalActiveTime,
        applicationBreakdown: appBreakdown
      });
    }
    
    // Limit history to 30 days
    if (sessionHistory.length > 30) {
      sessionHistory.shift();
    }
    
    this.store.set('sessionHistory', sessionHistory);
  }
  
  public saveInsight(insight: ProductivityInsight): void {
    const insights = this.store.get('insights');
    
    insights.push(insight);
    
    // Limit insights to 100 entries
    if (insights.length > 100) {
      insights.shift();
    }
    
    this.store.set('insights', insights);
  }
  
  public getSessionHistory(): SessionData[] {
    return this.store.get('sessionHistory');
  }
  
  public getInsights(): ProductivityInsight[] {
    return this.store.get('insights');
  }
  
  public getSettings(): Settings {
    return this.store.get('settings');
  }
  
  public updateSettings(settings: Partial<Settings>): void {
    const currentSettings = this.store.get('settings');
    this.store.set('settings', { ...currentSettings, ...settings });
  }
  
  public clearData(): void {
    this.store.clear();
  }
}
