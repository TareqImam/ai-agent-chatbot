import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function ChatMessage({ message }) {
    const isUser = message.role === 'user';
    
    return (
        <div className={`flex items-start ${isUser ? 'justify-end' : 'justify-start'} gap-2.5 mb-4`}>
            {!isUser && (
                <img
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    src={message.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=bot'}
                    alt="Bot Avatar"
                />
            )}
            
            <div className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'} max-w-[320px]`}>
                <div className={`flex items-center ${isUser ? 'justify-end' : 'justify-start'} space-x-2 rtl:space-x-reverse`}>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {isUser ? 'You' : 'AI Assistant'}
                    </span>
                </div>
                
                <div className={`flex flex-col leading-1.5 p-4 rounded-xl ${
                    isUser 
                        ? 'bg-blue-600 text-white rounded-s-xl rounded-ee-xl' 
                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-se-xl rounded-es-xl'
                }`}>
                    {isUser ? (
                        <p className="text-sm font-normal whitespace-pre-wrap">
                            {message.content}
                        </p>
                    ) : (
                        <div className="text-sm font-normal prose prose-sm max-w-none dark:prose-invert">
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                                    em: ({ children }) => <em className="italic">{children}</em>,
                                    code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs">{children}</code>,
                                    pre: ({ children }) => <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-x-auto">{children}</pre>,
                                    ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                                    li: ({ children }) => <li className="mb-1">{children}</li>,
                                    blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic">{children}</blockquote>,
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>
                
                <div className={`flex items-center ${isUser ? 'justify-end' : 'justify-start'} space-x-2 rtl:space-x-reverse`}>
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                    {isUser && (
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                            Delivered
                        </span>
                    )}
                </div>
            </div>
            
            {isUser && (
                <img
                    className="w-8 h-8 rounded-full flex-shrink-0"
                    src={message.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=male'}
                    alt="User Avatar"
                />
            )}
        </div>
    );
} 