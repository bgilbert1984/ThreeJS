import React from 'react';
import MessageList from './MessageList';
import Statistics from './Statistics';

const Dashboard: React.FC = () => {
    return (
        <div>
            <h1>Dashboard</h1>
            <Statistics />
            <MessageList />
        </div>
    );
};

export default Dashboard;