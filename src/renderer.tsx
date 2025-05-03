import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { WindowInfo, ProductivityInsight, SessionData, Settings } from './types';
import WindowList from './components/WindowList';
import InsightPanel from './components/InsightPanel';
import TimelineView from './components/TimelineView';
import StatisticsView from './components/StatisticsView';
import Mermaid from './components/Mermaid';
import { MonitorSmartphone, Clock, Bell, X } from 'lucide-react';

// Import CSS
import './styles.css';

// Declare the window API from preload
declare global {
  interface Window {
    desktopBuddy: {
      getWindows: () => Promise<WindowInfo[]>;
      getInsights: () => Promise<ProductivityInsight[]>;
      getSessionHistory: () => Promise<SessionData[]>;
      updateSettings: (settings: Partial<Settings>) => Promise<boolean>;
      onWindowsUpdated: (callback: (windows: WindowInfo[]) => void) => void;
      onInsightsUpdated: (callback: (insights: ProductivityInsight[]) => void) => void;
      onInitialData: (callback: (data: { 
        sessionHistory: SessionData[], 
        insights: ProductivityInsight[], 
        settings: Settings 
      }) => void) => void;
    };
  }
}

const App: React.FC = () => {
  const [windows, setWindows] = useState<WindowInfo[]>([]);
  const [insights, setInsights] = useState<ProductivityInsight[]>([]);
  const [sessionHistory, setSessionHistory] = useState<SessionData[]>([]);
  const [settings, setSettings] = useState<Settings>({
    pollingFrequency: 5000,
    thresholds: {
      'default': 60
    },
    notifications: true
  });
  const [activeView, setActiveView] = useState<'windows' | 'insights' | 'timeline' | 'statistics'>('windows');
  const [notifications, setNotifications] = useState<ProductivityInsight[]>([]);
  
  useEffect(() => {
    // Initialize data
    window.desktopBuddy.getWindows().then(setWindows);
    window.desktopBuddy.getInsights().then(setInsights);
    window.desktopBuddy.getSessionHistory().then(setSessionHistory);
    
    // Set up event listeners
    const windowsUpdatedCleanup = window.desktopBuddy.onWindowsUpdated(setWindows);
    
    const insightsUpdatedCleanup = window.desktopBuddy.onInsightsUpdated(
      (newInsights) => {
        setInsights(prev => [...prev, ...newInsights]);
        
        // Add to notifications
        if (settings.notifications) {
          setNotifications(prev => [...prev, ...newInsights]);
        }
      }
    );
    
    const initialDataCleanup = window.desktopBuddy.onInitialData(
      (data) => {
        setSessionHistory(data.sessionHistory);
        setInsights(data.insights);
        setSettings(data.settings);
      }
    );
    
    // Cleanup
    return () => {
      if (typeof windowsUpdatedCleanup === 'function') windowsUpdatedCleanup();
      if (typeof insightsUpdatedCleanup === 'function') insightsUpdatedCleanup();
      if (typeof initialDataCleanup === 'function') initialDataCleanup();
    };
  }, []);
  
  // Generate Mermaid diagram for open windows
  const generateMermaidDiagram = () => {
    // Group windows by application
    const appGroups: Record<string, WindowInfo[]> = {};
    
    windows.forEach(window => {
      if (!appGroups[window.application]) {
        appGroups[window.application] = [];
      }
      
      appGroups[window.application].push(window);
    });
    
    let diagram = 'flowchart TB\n';
    diagram += '  subgraph Desktop["User Desktop Environment"]\n';
    
    // Add application groups
    Object.entries(appGroups).forEach(([app, appWindows]) => {
      const appId = app.replace(/\s+/g, '');
      diagram += `    subgraph ${appId}["${app}"]\n`;
      
      // Add windows for this application
      appWindows.forEach(window => {
        const id = `win${window.id.replace(/[-]/g, '')}`;
        const duration = Math.round((Date.now() - window.startTime) / 60000);
        diagram += `      ${id}["${window.title}\\n${duration} min"]\n`;
      });
      
      diagram += '    end\n';
    });
    
    diagram += '  end\n';
    
    // Add styling
    diagram += 'classDef active fill:#4f46e5,color:white,stroke:#4338ca,stroke-width:2px;\n';
    diagram += 'classDef inactive fill:#f3f4f6,color:#1f2937,stroke:#e5e7eb,stroke-width:1px;\n';
    diagram += 'classDef category fill:#f0f9ff,color:#0c4a6e,stroke:#bae6fd,stroke-width:1px;\n';
    
    // Apply classes
    windows.forEach(window => {
      const id = `win${window.id.replace(/[-]/g, '')}`;
      diagram += `class ${id} ${window.isActive ? 'active' : 'inactive'};\n`;
    });
    
    // Apply category class to subgraphs
    Object.keys(appGroups).forEach(app => {
      const appId = app.replace(/\s+/g, '');
      diagram += `class ${appId} category;\n`;
    });
    
    return diagram;
  };
  
  // Dismiss notification
  const dismissNotification = (notification: ProductivityInsight) => {
    setNotifications(prev => prev.filter(n => n !== notification));
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 text-gray-800">
      {/* Header */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MonitorSmartphone size={24} />
            <h1 className="text-xl font-bold">DesktopBuddy</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center text-indigo-100">
              <Clock size={16} className="mr-1" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="relative">
              <Bell 
                size={20} 
                className="cursor-pointer hover:text-indigo-200"
              />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  {notifications.length}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Navigation */}
      <div className="bg-indigo-700 text-white p-1 flex justify-center space-x-1">
        <button 
          className={`px-4 py-2 rounded ${activeView === 'windows' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
          onClick={() => setActiveView('windows')}
        >
          Active Windows
        </button>
        <button 
          className={`px-4 py-2 rounded ${activeView === 'insights' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
          onClick={() => setActiveView('insights')}
        >
          Insights
        </button>
        <button 
          className={`px-4 py-2 rounded ${activeView === 'timeline' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
          onClick={() => setActiveView('timeline')}
        >
          Timeline
        </button>
        <button 
          className={`px-4 py-2 rounded ${activeView === 'statistics' ? 'bg-indigo-800' : 'hover:bg-indigo-600'}`}
          onClick={() => setActiveView('statistics')}
        >
          Statistics
        </button>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Active Windows View */}
        {activeView === 'windows' && (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Active Windows ({windows.length})</h2>
              <WindowList windows={windows} />
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Window Relationships</h2>
              <Mermaid chart={generateMermaidDiagram()} />
            </div>
          </div>
        )}
        
        {/* Insights View */}
        {activeView === 'insights' && (
          <InsightPanel insights={insights} />
        )}
        
        {/* Timeline View */}
        {activeView === 'timeline' && (
          <TimelineView windows={windows} sessionHistory={sessionHistory} />
        )}
        
        {/* Statistics View */}
        {activeView === 'statistics' && (
          <StatisticsView windows={windows} sessionHistory={sessionHistory} />
        )}
      </main>
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed bottom-4 right-4 w-80">
          {notifications.map((notification, index) => (
            <div 
              key={`notification-${index}`} 
              className="bg-white shadow-lg rounded-lg p-4 mb-2 border-l-4 border-yellow-500 animate-fade-in-up"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{notification.title}</h4>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => dismissNotification(notification)}
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
