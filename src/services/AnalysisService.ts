import { WindowInfo, ProductivityInsight } from '../types';

export class AnalysisService {
  private windows: WindowInfo[] = [];
  private appThresholds: Record<string, number> = {
    'Google Chrome': 45, // minutes
    'Microsoft Edge': 45,
    'Firefox': 45,
    'Slack': 30,
    'Discord': 20,
    'default': 60
  };
  
  public updateWindows(windows: WindowInfo[]): void {
    this.windows = windows;
  }
  
  public setThreshold(application: string, minutes: number): void {
    this.appThresholds[application] = minutes;
  }
  
  public generateInsights(): ProductivityInsight[] {
    const insights: ProductivityInsight[] = [];
    const now = Date.now();
    
    // Group windows by application
    const appGroups = this.groupByApplication();
    
    // Check for application overuse
    for (const [app, windows] of Object.entries(appGroups)) {
      const totalTime = this.calculateTotalAppTime(windows);
      const threshold = this.appThresholds[app] || this.appThresholds.default;
      
      if (totalTime > threshold) {
        insights.push({
          type: 'warning',
          title: 'Application Overuse',
          message: `You've spent over ${totalTime} minutes on ${app}. Consider taking a break.`,
          category: 'health',
          timestamp: now
        });
      }
    }
    
    // Check for too many open windows
    if (this.windows.length > 10) {
      insights.push({
        type: 'suggestion',
        title: 'Too Many Open Windows',
        message: `You have ${this.windows.length} windows open. Consider closing unused ones to reduce clutter.`,
        category: 'organization',
        timestamp: now
      });
    }
    
    // Check for potential distractions
    const distractionApps = ['YouTube', 'Facebook', 'Twitter', 'Instagram', 'Reddit', 'TikTok'];
    const openDistractions = this.windows.filter(w => 
      distractionApps.some(app => w.title.includes(app) || w.application.includes(app))
    );
    
    if (openDistractions.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Potential Distractions',
        message: `Found ${openDistractions.length} potential distractions open. Consider closing them to improve focus.`,
        category: 'distraction',
        timestamp: now
      });
    }
    
    // Check if user has been working for too long without a break
    const oldestWindowTime = Math.min(...this.windows.map(w => w.startTime));
    const hoursWorking = (now - oldestWindowTime) / (1000 * 60 * 60);
    
    if (hoursWorking > 2) {
      insights.push({
        type: 'info',
        title: 'Take a Break',
        message: `You've been working for over ${Math.round(hoursWorking)} hours. Consider taking a short break to rest your eyes.`,
        category: 'health',
        timestamp: now
      });
    }
    
    return insights;
  }
  
  private groupByApplication(): Record<string, WindowInfo[]> {
    const groups: Record<string, WindowInfo[]> = {};
    
    this.windows.forEach(window => {
      if (!groups[window.application]) {
        groups[window.application] = [];
      }
      
      groups[window.application].push(window);
    });
    
    return groups;
  }
  
  private calculateTotalAppTime(windows: WindowInfo[]): number {
    return windows.reduce((total, window) => {
      const duration = (Date.now() - window.startTime) / 60000; // Convert to minutes
      return total + duration;
    }, 0);
  }
}
