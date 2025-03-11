import React, { useState } from 'react';
import MessageList from './MessageList';
import Statistics from './Statistics';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Dashboard: React.FC = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to the list
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      // Add assistant message to the list
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
      setMessage('');
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <h1 className="text-xl font-bold mb-8">Claude Dashboard</h1>
        <nav className="space-y-2">
          <a href="#" className="block p-2 bg-gray-800 rounded">Dashboard</a>
          <a href="#" className="block p-2 hover:bg-gray-800 rounded">Conversations</a>
          <a href="#" className="block p-2 hover:bg-gray-800 rounded">Analytics</a>
          <a href="#" className="block p-2 hover:bg-gray-800 rounded">Settings</a>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4">
          <h2 className="text-lg font-semibold">Claude Chat</h2>
        </header>

        {/* Content area */}
        <div className="flex-1 flex">
          {/* Chat area */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-4 overflow-y-auto">
              <MessageList messages={messages} />
              {error && (
                <div className="p-3 bg-red-100 text-red-800 rounded-lg mb-4">
                  Error: {error}
                </div>
              )}
            </div>
            
            {/* Input area */}
            <div className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:bg-blue-400"
                  disabled={isLoading || !message.trim()}
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
          
          {/* Stats sidebar */}
          <div className="w-80 border-l p-4 bg-gray-50">
            <Statistics messages={messages} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;