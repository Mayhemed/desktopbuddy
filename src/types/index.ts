export interface WindowInfo {
  id: string;
  title: string;
  application: string;
  path?: string;
  url?: string;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isActive: boolean;
  startTime: number;
  lastActiveTime: number;
}

export interface ProductivityInsight {
  type: 'suggestion' | 'warning' | 'info';
  title: string;
  message: string;
  category: 'distraction' | 'efficiency' | 'health' | 'organization';
  timestamp: number;
}

export interface SessionData {
  date: string;
  windows: WindowInfo[];
  totalActiveTime: number;
  applicationBreakdown: Record<string, number>;
}

export interface Settings {
  pollingFrequency: number;
  thresholds: Record<string, number>;
  notifications: boolean;
}
