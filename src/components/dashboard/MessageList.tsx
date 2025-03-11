import React, { useEffect, useState } from 'react';
import { fetchMessages } from '../../lib/api';
import { Message } from '../../types';

const MessageList: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const data = await fetchMessages();
                setMessages(data);
            } catch (err) {
                setError('Failed to load messages');
            } finally {
                setLoading(false);
            }
        };

        loadMessages();
    }, []);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>Messages</h2>
            <ul>
                {messages.map((message) => (
                    <li key={message.id}>{message.content}</li>
                ))}
            </ul>
        </div>
    );
};

export default MessageList;