import React from 'react';
import { ProductivityInsight } from '../types';
import { AlertTriangle, Info, Lightbulb, X } from 'lucide-react';

interface InsightPanelProps {
  insights: ProductivityInsight[];
}

const InsightPanel: React.FC<InsightPanelProps> = ({ insights }) => {
  // Group insights by category
  const groupedInsights: Record<string, ProductivityInsight[]> = {
    'health': [],
    'distraction': [],
    'organization': [],
    'efficiency': []
  };
  
  insights.forEach(insight => {
    groupedInsights[insight.category].push(insight);
  });
  
  // Get icon based on insight type
  const getInsightIcon = (type: ProductivityInsight['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle size={18} className="text-yellow-500" />;
      case 'info':
        return <Info size={18} className="text-blue-500" />;
      case 'suggestion':
        return <Lightbulb size={18} className="text-green-500" />;
      default:
        return <Info size={18} className="text-blue-500" />;
    }
  };
  
  // Get background color based on insight type
  const getInsightColor = (type: ProductivityInsight['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'suggestion':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className="space-y-6">
      {Object.entries(groupedInsights).map(([category, categoryInsights]) => (
        <div key={category} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-indigo-500 text-white px-4 py-3">
            <h2 className="text-lg font-medium capitalize">{category} Insights</h2>
          </div>
          
          <div className="p-4">
            {categoryInsights.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No {category} insights available
              </div>
            ) : (
              <div className="space-y-3">
                {categoryInsights.map((insight, index) => (
                  <div 
                    key={`${insight.title}-${index}`}
                    className={`p-3 rounded border ${getInsightColor(insight.type)} flex`}
                  >
                    <div className="mr-3 mt-0.5">
                      {getInsightIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{insight.title}</h3>
                        <span className="text-xs text-gray-500">{formatTimestamp(insight.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default InsightPanel;
