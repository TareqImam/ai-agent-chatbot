import React, { useState, useEffect, useRef } from 'react';
import MessageInput from './MessageInput';
import ChatMessage from './ChatMessage';
import SessionSidebar from './SessionSidebar';

export default function ChatWindow() {
    const [selectedModel, setSelectedModel] = useState('gemini');
    const [chatHistory, setChatHistory] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const messagesEndRef = useRef(null);
    const sidebarRef = useRef(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const fetchMessage = async (displayMessage, fullMessage = null) => {
        setIsLoading(true);
        try {
            // Use fullMessage if provided (for CSV uploads), otherwise use displayMessage
            const messageToSend = fullMessage || displayMessage;
            
            const response = await fetch('http://localhost:5001/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    displayMessage: displayMessage,
                    fullMessage: fullMessage,
                    sessionId: currentSessionId 
                }),
            });

            const data = await response.json();
            if (data.success) {
                setChatHistory(data.data.chatHistory);
                setCurrentSessionId(data.data.sessionId);
                // Refresh sidebar after new message
                if (sidebarRef.current && sidebarRef.current.refresh) {
                    sidebarRef.current.refresh();
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const createNewChat = async () => {
        try {
            const response = await fetch('http://localhost:5001/gemini/new-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();
            if (data.success) {
                setChatHistory([]);
                setCurrentSessionId(data.data.sessionId);
                // Refresh sidebar after creating new chat
                if (sidebarRef.current && sidebarRef.current.refresh) {
                    sidebarRef.current.refresh();
                }
            }
        } catch (error) {
            console.error('Error creating new chat:', error);
        }
    };

    const loadChatHistory = async (sessionId) => {
        try {
            const response = await fetch(`http://localhost:5001/gemini/history/${sessionId}`);
            const data = await response.json();
            if (data.success) {
                setChatHistory(data.data.chatHistory);
                setCurrentSessionId(data.data.sessionId);
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    const handleSessionSelect = (sessionId) => {
        loadChatHistory(sessionId);
    };

    const handleDeleteSession = () => {
        // This will be handled by the SessionSidebar component
        createNewChat();
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            {/* Session Sidebar */}
            {showSidebar && (
                <SessionSidebar
                    ref={sidebarRef}
                    currentSessionId={currentSessionId}
                    onSessionSelect={handleSessionSelect}
                    onNewChat={createNewChat}
                    onDeleteSession={handleDeleteSession}
                />
            )}
            
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="flex items-center">
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="mr-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <img
                            className="w-10 h-10 rounded-full"
                            src="https://api.dicebear.com/7.x/bottts/svg?seed=bot"
                            alt="AI Avatar"
                        />
                        <div className="ml-3">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                AI Assistant
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {currentSessionId ? 'Active Session' : 'New Chat'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="gemini">Gemini</option>
                            <option value="claude">Claude</option>
                            <option value="gpt-4">GPT-4</option>
                            <option value="gpt-3.5">GPT-3.5</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                    {chatHistory.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    Start a new conversation
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400">
                                    Type a message below or upload a CSV file to begin chatting with the AI assistant.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {chatHistory.map((message, index) => (
                                <ChatMessage key={index} message={message} />
                            ))}
                            {isLoading && (
                                <div className="flex items-start justify-start gap-2.5 mb-4">
                                    <img
                                        className="w-8 h-8 rounded-full flex-shrink-0"
                                        src="https://api.dicebear.com/7.x/bottts/svg?seed=bot"
                                        alt="Bot Avatar"
                                    />
                                    <div className="flex flex-col gap-1 max-w-[320px]">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                AI Assistant
                                            </span>
                                        </div>
                                        <div className="flex flex-col leading-1.5 p-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-se-xl rounded-es-xl">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <MessageInput onSubmit={fetchMessage} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
} 