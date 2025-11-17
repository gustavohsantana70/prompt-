

import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { AddIcon, SendIcon } from './icons';

interface ChatPanelProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    isLoading: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, isLoading }) => {
    const [description, setDescription] = useState('');
    const [selectedPRD, setSelectedPRD] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendClick = () => {
        onSendMessage(description);
        setDescription('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendClick();
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <select
                        value={selectedPRD}
                        onChange={(e) => setSelectedPRD(e.target.value)}
                        className="flex-1 w-full px-3 py-2 text-sm text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Selecione um PRD</option>
                        <option value="1">PRD - E-commerce</option>
                        <option value="2">PRD - App de Agendamento</option>
                    </select>
                    <button className="p-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <AddIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50">
                <div className="space-y-4">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex items-start gap-3 ${msg.from === 'user' ? 'justify-end' : ''}`}>
                            {msg.from === 'ia' && (
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-indigo-500 text-white rounded-full font-bold text-sm">IA</div>
                            )}
                             <div className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${msg.from === 'ia' ? 'bg-white border border-gray-200' : 'bg-indigo-500 text-white'}`}>
                                <p className="text-sm">{msg.text}</p>
                            </div>
                            {msg.from === 'user' && (
                                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gray-300 text-gray-700 rounded-full font-bold text-sm">U</div>
                            )}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
            </div>

            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center gap-2">
                    {/* FIX: Removed invalid 'fullWidth' prop. The 'w-full' and 'flex-1' classes handle the width. */}
                    <input
                        type="text"
                        placeholder="Descreva seu app..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="flex-1 w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                    <button
                        onClick={handleSendClick}
                        disabled={isLoading || !description.trim()}
                        className="p-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (
                            <SendIcon className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};