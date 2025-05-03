import React from 'react';
import { WindowInfo } from '../types';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface WindowListProps {
  windows: WindowInfo[];
}

const WindowList: React.FC<WindowListProps> = ({ windows }) => {
  // Helper function to format time duration
  const formatDuration = (startTime: number): string => {
    const durationMinutes = Math.floor((Date.now() - startTime) / 60000);
    
    if (durationMinutes < 60) {
      return `${durationMinutes} min`;
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    
    return `${hours}h ${mins}m`;
  };
  
  return (
    <div className="space-y-4">
      {windows.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No active windows detected
        </div>
      ) : (
        windows.map((window) => (
          <div 
            key={window.id} 
            className={`border rounded-lg shadow overflow-hidden ${
              window.isActive ? 'border-indigo-500' : 'border-gray-200'
            }`}
          >
            <div 
              className={`px-4 py-3 flex justify-between items-center ${
                window.isActive ? 'bg-indigo-500 text-white' : 'bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-red-500"></div>
                <div className="w-3 h-3 rounded-full mr-2 bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
                <h3 className={`font-medium ${window.isActive ? 'text-white' : 'text-gray-700'}`}>
                  {window.title}
                </h3>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="text-xs p-1 rounded hover:bg-opacity-20 hover:bg-gray-700"
                  title="Minimize"
                >
                  <Minimize2 size={14} />
                </button>
                <button 
                  className="text-xs p-1 rounded hover:bg-opacity-20 hover:bg-gray-700"
                  title="Maximize"
                >
                  <Maximize2 size={14} />
                </button>
                <button 
                  className="text-xs p-1 rounded hover:bg-opacity-20 hover:bg-gray-700"
                  title="Close"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="p-4 bg-white">
              <div className="flex justify-between mb-2">
                <div className="text-sm text-gray-500">Application</div>
                <div className="text-sm font-medium">{window.application}</div>
              </div>
              <div className="flex justify-between mb-2">
                <div className="text-sm text-gray-500">Open for</div>
                <div className="text-sm font-medium">{formatDuration(window.startTime)}</div>
              </div>
              <div className="flex justify-between">
                <div className="text-sm text-gray-500">Status</div>
                <div className="text-sm font-medium flex items-center">
                  <span 
                    className={`w-2 h-2 rounded-full mr-1 ${window.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                  ></span>
                  {window.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
              <button 
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                Focus Window
              </button>
              <button 
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                App Details
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default WindowList;
