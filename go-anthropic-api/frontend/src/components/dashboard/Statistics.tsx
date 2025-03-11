import React, { useMemo } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface StatisticsProps {
  messages: Message[];
}

const Statistics: React.FC<StatisticsProps> = ({ messages }) => {
  const stats = useMemo(() => {
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    
    const userWordCount = userMessages.reduce((acc, m) => 
      acc + m.content.split(/\s+/).filter(Boolean).length, 0);
    
    const assistantWordCount = assistantMessages.reduce((acc, m) => 
      acc + m.content.split(/\s+/).filter(Boolean).length, 0);
    
    // Calculate average response time
    let avgResponseTime = 0;
    if (userMessages.length > 0 && assistantMessages.length > 0) {
      let totalTime = 0;
      let count = 0;
      for (let i = 0; i < messages.length - 1; i++) {
        if (messages[i].role === 'user' && messages[i+1].role === 'assistant') {
          totalTime += messages[i+1].timestamp.getTime() - messages[i].timestamp.getTime();
          count++;
        }
      }
      avgResponseTime = count > 0 ? totalTime / count : 0;
    }
    
    return {
      totalMessages: messages.length,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
      userWordCount,
      assistantWordCount,
      avgResponseTime: avgResponseTime > 0 ? Math.round(avgResponseTime / 1000) : 0, // in seconds
    };
  }, [messages]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Conversation Stats</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Total Messages</div>
          <div className="text-2xl font-bold">{stats.totalMessages}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Word Count</div>
          <div className="text-2xl font-bold">{stats.userWordCount + stats.assistantWordCount}</div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium mb-2">Message Distribution</h4>
        <div className="w-full bg-gray-200 rounded-full h-4">
          {stats.totalMessages > 0 && (
            <div 
              className="bg-blue-600 h-4 rounded-full" 
              style={{ width: `${(stats.userMessages / stats.totalMessages) * 100}%` }}
            ></div>
          )}
        </div>
        <div className="flex justify-between text-sm mt-1">
          <div>User: {stats.userMessages}</div>
          <div>Assistant: {stats.assistantMessages}</div>
        </div>
      </div>
      
      {stats.avgResponseTime > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-500">Avg. Response Time</div>
          <div className="text-2xl font-bold">{stats.avgResponseTime} sec</div>
        </div>
      )}
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-sm font-medium mb-4">Message Length Comparison</h4>
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-sm">
              <span>User</span>
              <span>{stats.userWordCount} words</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min(100, (stats.userWordCount / 200) * 100)}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span>Assistant</span>
              <span>{stats.assistantWordCount} words</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${Math.min(100, (stats.assistantWordCount / 200) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;