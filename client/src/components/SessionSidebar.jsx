import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

const SessionSidebar = forwardRef(({ 
    currentSessionId, 
    onSessionSelect, 
    onNewChat, 
    onDeleteSession 
}, ref) => {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSessions = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5001/gemini/sessions');
            const data = await response.json();
            if (data.success) {
                setSessions(data.data.sessions);
            }
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        refresh: fetchSessions
    }));

    useEffect(() => {
        fetchSessions();
    }, [currentSessionId]); // Refresh when currentSessionId changes

    const handleDeleteSession = async (sessionId, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this chat?')) {
            try {
                const response = await fetch(`http://localhost:5001/gemini/sessions/${sessionId}`, {
                    method: 'DELETE',
                });
                const data = await response.json();
                if (data.success) {
                    setSessions(sessions.filter(s => s.sessionId !== sessionId));
                    if (currentSessionId === sessionId) {
                        onNewChat();
                    }
                }
            } catch (error) {
                console.error('Error deleting session:', error);
            }
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 24) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    return (
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={onNewChat}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm font-medium transition-colors"
                >
                    + New Chat
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Loading chats...
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No chats yet
                    </div>
                ) : (
                    <div className="p-2">
                        {sessions.map((session) => (
                            <div
                                key={session.sessionId}
                                onClick={() => onSessionSelect(session.sessionId)}
                                className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                                    currentSessionId === session.sessionId
                                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">
                                            {session.lastMessage?.content || 'New chat'}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {session.messageCount} messages • {formatTime(session.updatedAt)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleDeleteSession(session.sessionId, e)}
                                        className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Delete chat"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
});

SessionSidebar.displayName = 'SessionSidebar';

export default SessionSidebar; 