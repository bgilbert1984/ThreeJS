import React, { useState, useEffect, useCallback } from 'react';
import { NodeData } from '../types';

interface QuestDBConnectorProps {
  interval?: number; // Polling interval in milliseconds
  query: string; // SQL query to execute
  onDataFetched: (data: NodeData[]) => void; // Callback when data is fetched
  onError?: (error: Error) => void; // Optional error handler
}

/**
 * QuestDBConnector fetches time-series data from QuestDB and passes it to Three.js visualization
 */
const QuestDBConnector: React.FC<QuestDBConnectorProps> = ({
  interval = 2000,
  query,
  onDataFetched,
  onError
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Format date for display
  const formattedDate = lastUpdated ? 
    new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(lastUpdated) : 'Never';
  
  // Fetch data from QuestDB
  const fetchData = useCallback(async () => {
    try {
      setStatus('loading');
      
      // Use QuestDB's HTTP endpoint to query data
      const response = await fetch('http://localhost:9000/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, limit: 1000 })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`QuestDB query failed: ${errorText}`);
      }
      
      const result = await response.json();
      
      // Process data for Three.js visualization
      if (result && result.dataset) {
        const processedData = processQuestDBData(result);
        onDataFetched(processedData);
        setLastUpdated(new Date());
        setStatus('success');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      setStatus('error');
      if (onError && error instanceof Error) {
        onError(error);
      }
      console.error('Error fetching data from QuestDB:', error);
    }
  }, [query, onDataFetched, onError]);
  
  // Process QuestDB data into format required for Three.js nodes
  const processQuestDBData = (result: any): NodeData[] => {
    if (!result.dataset || !result.dataset.length) {
      return [];
    }
    
    // Extract column names from the result
    const columns = result.columns.map((col: any) => col.name);
    
    // Transform data into NodeData objects
    return result.dataset.map((row: any, index: number) => {
      // Create an object with column names as keys and row values
      const rowData: Record<string, any> = {};
      columns.forEach((colName: string, colIdx: number) => {
        rowData[colName] = row[colIdx];
      });
      
      // Create a NodeData object (adjust fields based on your schema)
      const nodeData: NodeData = {
        name: `node-${index}`, // Use a meaningful identifier from your data
        color: getColorFromData(rowData), // Logic to determine color from data
        position: getPositionFromData(rowData, index), // Logic to determine position from data
        connectedTo: getConnectionsFromData(rowData, index, result.dataset.length) // Logic for connections
      };
      
      return nodeData;
    });
  };
  
  // Helper function to determine node color based on data
  const getColorFromData = (data: Record<string, any>): string => {
    // Example logic - customize based on your data
    // E.g., color based on some value threshold or category
    if (data.value && typeof data.value === 'number') {
      // Color based on value: red for high, blue for low
      const hue = Math.max(0, Math.min(240, 240 - (data.value * 240)));
      return `hsl(${hue}, 70%, 60%)`;
    }
    // Default color if no specific logic applies
    return '#' + Math.floor(Math.random()*16777215).toString(16);
  };
  
  // Helper function to determine node position based on data
  const getPositionFromData = (data: Record<string, any>, index: number): [number, number, number] => {
    // Example logic - customize based on your data
    // Position nodes in a circle by default
    if (data.x !== undefined && data.y !== undefined && data.z !== undefined) {
      // If explicit coordinates are provided
      return [data.x, data.y, data.z];
    }
    
    // Default circular arrangement
    const angle = (index / 10) * Math.PI * 2;
    const radius = 3;
    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      0
    ];
  };
  
  // Helper function to determine node connections based on data
  const getConnectionsFromData = (data: Record<string, any>, index: number, totalCount: number): number[] => {
    // Example logic - customize based on your data
    // By default, connect to adjacent nodes in a circle
    const connections: number[] = [];
    
    // Connect to previous node (wrap around for first node)
    if (index > 0) {
      connections.push(index - 1);
    } else if (totalCount > 1) {
      connections.push(totalCount - 1);
    }
    
    // Connect to next node (wrap around for last node)
    if (index < totalCount - 1) {
      connections.push(index + 1);
    } else if (totalCount > 1) {
      connections.push(0);
    }
    
    // Add any data-specific connections
    if (data.connects_to && Array.isArray(data.connects_to)) {
      connections.push(...data.connects_to);
    }
    
    return connections;
  };
  
  // Set up polling interval
  useEffect(() => {
    // Initial fetch
    fetchData();
    
    // Set up interval for polling
    const timerId = setInterval(fetchData, interval);
    
    // Clean up interval on component unmount
    return () => clearInterval(timerId);
  }, [fetchData, interval]);
  
  return (
    <div className="questdb-connector">
      <div className="status-bar">
        <div className={`status-indicator status-${status}`}></div>
        <div className="status-text">
          {status === 'loading' ? 'Fetching data...' :
           status === 'success' ? `Connected to QuestDB` :
           status === 'error' ? 'Connection error' : 'Initializing...'}
        </div>
        <div className="last-updated">
          Last updated: {formattedDate}
        </div>
      </div>
    </div>
  );
};

export default QuestDBConnector;