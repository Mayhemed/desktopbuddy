import React, { useState } from 'react';
import { WindowInfo, SessionData } from '../types';
import { BarChart2, PieChart, Coffee } from 'lucide-react';

interface StatisticsViewProps {
  windows: WindowInfo[];
  sessionHistory: SessionData[];
}

const StatisticsView: React.FC<StatisticsViewProps> = ({ windows, sessionHistory }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Get app color for graphs
  const getAppColor = (app: string): string => {
    const colorMap: Record<string, string> = {
      'Google Chrome': '#4285F4',
      'Microsoft Edge': '#0078D7',
      'Firefox': '#FF7139',
      'Visual Studio Code': '#007ACC',
      'Microsoft Word': '#2B579A',
      'Microsoft Excel': '#217346',
      'Slack': '#4A154B',
      'Discord': '#5865F2'
    };
    
    return colorMap[app] || '#6366F1'; // Default to indigo
  };
  
  // Get session data for selected date
  const getSessionData = (): SessionData | undefined => {
    return sessionHistory.find(session => session.date === selectedDate);
  };
  
  // Calculate app usage statistics
  const calculateAppUsage = () => {
    const session = getSessionData();
    
    if (session) {
      return session.applicationBreakdown;
    }
    
    // Calculate from current windows
    const appUsage: Record<string, number> = {};
    
    windows.forEach(window => {
      const app = window.application;
      if (!appUsage[app]) {
        appUsage[app] = 0;
      }
      
      const duration = (Date.now() - window.startTime) / 60000; // Minutes
      appUsage[app] += duration;
    });
    
    return appUsage;
  };
  
  // Calculate total active time
  const calculateTotalActiveTime = (): number => {
    const session = getSessionData();
    
    if (session) {
      return session.totalActiveTime;
    }
    
    // Calculate from current windows
    return Object.values(calculateAppUsage()).reduce((sum, duration) => sum + duration, 0);
  };
  
  // Helper to format time in minutes
  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    
    const hrs = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    return `${hrs}h ${mins}m`;
  };
  
  const appUsageStats = calculateAppUsage();
  const totalActiveTime = calculateTotalActiveTime();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <select 
          className="border rounded p-2"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        >
          {sessionHistory.map(session => (
            <option key={session.date} value={session.date}>
              {new Date(session.date).toLocaleDateString()}
            </option>
          ))}
          <option value={new Date().toISOString().split('T')[0]}>Today</option>
        </select>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <BarChart2 size={20} className="mr-2 text-indigo-600" />
            Application Usage
          </h3>
          
          {Object.keys(appUsageStats).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No usage data available for this date
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(appUsageStats).map(([app, duration]) => (
                <div key={app}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{app}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full" 
                      style={{
                        width: `${(duration / totalActiveTime) * 100}%`,
                        backgroundColor: getAppColor(app)
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium mb-3 flex items-center">
            <PieChart size={20} className="mr-2 text-indigo-600" />
            Time Summary
          </h3>
          
          <div className="flex flex-col items-center">
            <div className="w-40 h-40 rounded-full border-8 border-indigo-500 flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{formatTime(totalActiveTime)}</div>
                <div className="text-sm text-gray-500">Total Active Time</div>
              </div>
            </div>
            
            <div className="w-full grid grid-cols-2 gap-4 text-center">
              <div className="bg-indigo-50 p-3 rounded">
                <div className="text-xl font-semibold">
                  {Object.keys(appUsageStats).length}
                </div>
                <div className="text-xs text-gray-500">Applications Used</div>
              </div>
              <div className="bg-indigo-50 p-3 rounded">
                <div className="text-xl font-semibold">
                  {session => session?.windows.length || windows.length}
                </div>
                <div className="text-xs text-gray-500">Open Windows</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-3 flex items-center">
          <Coffee size={20} className="mr-2 text-indigo-600" />
          Productivity Insights
        </h3>
        
        <div className="space-y-3">
          {Object.entries(appUsageStats)
            .filter(([app, duration]) => duration > 30) // Filter for apps with more than 30 minutes
            .map(([app, duration]) => (
              <div 
                key={app}
                className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded"
              >
                <h4 className="font-medium">{app} Usage</h4>
                <p className="text-sm text-gray-600">
                  You've spent {formatTime(duration)} in {app}. 
                  {duration > 60 ? " Consider taking a break or switching tasks." : ""}
                </p>
              </div>
            ))}
          
          {totalActiveTime > 120 && (
            <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
              <h4 className="font-medium">Break Reminder</h4>
              <p className="text-sm text-gray-600">
                You've been active for over {Math.floor(totalActiveTime / 60)} hours. 
                Consider taking a short 5-minute break to rest your eyes and stretch.
              </p>
            </div>
          )}
          
          {Object.keys(appUsageStats).length > 5 && (
            <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded">
              <h4 className="font-medium">Context Switching</h4>
              <p className="text-sm text-gray-600">
                You've used {Object.keys(appUsageStats).length} different applications. 
                Consider consolidating your work to reduce context switching.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatisticsView;
