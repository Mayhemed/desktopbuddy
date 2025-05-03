import React, { useState } from 'react';
import { WindowInfo, SessionData } from '../types';
import { Calendar, Clock } from 'lucide-react';

interface TimelineViewProps {
  windows: WindowInfo[];
  sessionHistory: SessionData[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ windows, sessionHistory }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Get color for application
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
  
  // Generate timeline items from windows
  const generateTimelineItems = () => {
    const session = getSessionData();
    
    if (!session) {
      return windows.map((window, index) => {
        const startTime = new Date(window.startTime);
        const duration = Math.floor((Date.now() - window.startTime) / 60000);
        
        return {
          id: window.id,
          time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          app: window.application,
          title: window.title,
          duration: `${duration} min`,
          color: getAppColor(window.application)
        };
      });
    }
    
    // Use historical data
    return session.windows.map((window, index) => {
      const startTime = new Date(window.startTime);
      const duration = Math.floor((window.lastActiveTime - window.startTime) / 60000);
      
      return {
        id: window.id,
        time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        app: window.application,
        title: window.title,
        duration: `${duration} min`,
        color: getAppColor(window.application)
      };
    });
  };
  
  const timelineItems = generateTimelineItems();
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="bg-indigo-500 text-white px-4 py-3 flex justify-between items-center">
        <h2 className="text-lg font-medium">Activity Timeline</h2>
        <div className="flex items-center">
          <Calendar size={18} className="mr-2" />
          <select 
            className="bg-indigo-600 text-white border border-indigo-400 rounded px-2 py-1"
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
      </div>
      
      <div className="p-4">
        {timelineItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No activity data available for this date
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <div className="space-y-6">
              {timelineItems.map((item) => (
                <div key={item.id} className="relative pl-10">
                  <div 
                    className="absolute left-0 mt-1.5 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: item.color }}
                  >
                    <span className="text-white text-xs font-bold">
                      {item.app.substring(0, 2)}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <Clock size={14} className="mr-1" />
                      {item.time}
                    </div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">{item.app}</span> • {item.duration}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineView;
